// File: src/components/UploadDialog.jsx
import { useState } from "react";
import {
  Button,
  FileInput,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as API from "../api";

export default function UploadDialog({ opened, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [pct, setPct] = useState(0);
  const [busy, setBusy] = useState(false);

  async function doUpload() {
    if (!file) return;
    setBusy(true);
    try {
      const presign = await API.createUploadUrl(file.name, file.size);
      if (presign.strategy === "single") {
        await fetch(presign.url, {
          method: "PUT",
          headers: { "content-type": "video/mp4" },
          body: file,
        });
        await API.completeUpload({
          videoId: presign.videoId,
          key: presign.key,
        });
      } else {
        const partSize = presign.partSizeBytes;
        const sent = [];
        let uploaded = 0;
        for (const part of presign.parts) {
          const start = (part.partNumber - 1) * partSize;
          const end = Math.min(start + partSize, file.size);
          const chunk = file.slice(start, end);
          const r = await fetch(part.url, {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body: chunk,
          });
          if (!r.ok)
            throw new Error(`Part ${part.partNumber} failed: ${r.status}`);
          const etag = r.headers.get("etag") || r.headers.get("ETag");
          if (!etag)
            throw new Error(`Missing ETag for part ${part.partNumber}`);
          sent.push({ partNumber: part.partNumber, eTag: etag });
          uploaded += chunk.size;
          setPct(Math.round((uploaded / file.size) * 100));
        }
        await API.completeUpload({
          videoId: presign.videoId,
          key: presign.key,
          uploadId: presign.uploadId,
          parts: sent,
        });
      }
      notifications.show({ title: "Upload complete", message: file.name });
      onDone();
      onClose();
    } catch (e) {
      notifications.show({
        color: "red",
        title: "Upload failed",
        message: e.message,
      });
    } finally {
      setBusy(false);
      setPct(0);
      setFile(null);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Upload .mp4">
      <Stack>
        <FileInput
          accept="video/mp4"
          label="Choose file"
          value={file}
          onChange={setFile}
        />
        {busy && <Progress value={pct} />}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={doUpload} disabled={!file} loading={busy}>
            Upload
          </Button>
        </Group>
        <Text size="sm" c="dimmed">
          Supports single & multipart (server-driven)
        </Text>
      </Stack>
    </Modal>
  );
}
