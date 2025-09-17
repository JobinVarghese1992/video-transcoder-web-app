// src/pages/VideoDetailPage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import * as API from "../api";
import { notifications } from "@mantine/notifications";

export default function VideoDetailPage() {
  const { videoId } = useParams({ from: "/videos/$videoId" });
  const qc = useQueryClient();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => API.getVideo(videoId),
  });

  const mSave = useMutation({
    mutationFn: (patch) => API.updateVideo(videoId, patch),
    onSuccess: () => {
      notifications.show({ title: "Saved", message: "Metadata updated" });
      qc.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  const mDelete = useMutation({
    mutationFn: () => API.deleteVideo(videoId),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: data?.fileName });
      router.navigate({ to: "/" });
    },
  });

  if (!data) return null;

  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>{data.fileName}</Title>
        <Group>
          <Button
            color="red"
            variant="light"
            onClick={() => mDelete.mutate()}
            loading={mDelete.isPending}
          >
            Delete
          </Button>
          <Button
            onClick={async () => {
              await API.startTranscode(videoId);
              qc.invalidateQueries({ queryKey: ["video", videoId] });
            }}
          >
            Transcode
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <Title order={5}>Metadata</Title>
        <TextInput
          label="Title"
          defaultValue={data.title || ""}
          onBlur={(e) => mSave.mutate({ title: e.currentTarget.value })}
        />
        <Textarea
          label="Description"
          minRows={3}
          defaultValue={data.description || ""}
          onBlur={(e) => mSave.mutate({ description: e.currentTarget.value })}
        />
      </Card>

      <Card withBorder>
        <Title order={5}>Transcoded variants</Title>
        {data.variants?.length ? (
          <Stack>
            {data.variants.map((v) => (
              <Card key={v.variantId} withBorder>
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={600}>
                      {v.format.toUpperCase()} · {v.resolution}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Status: {v.transcode_status}
                    </Text>
                    {typeof v.size === "number" && (
                      <Text size="xs" c="dimmed">
                        Size: {v.size.toLocaleString()} bytes
                      </Text>
                    )}
                  </Stack>
                  {v.url ? (
                    <video src={v.url} controls width={360} />
                  ) : (
                    <Text c="dimmed">URL not ready</Text>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text c="dimmed">No variants yet.</Text>
        )}
      </Card>
    </Stack>
  );
}
