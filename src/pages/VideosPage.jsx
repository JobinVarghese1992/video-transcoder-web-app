import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Image,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconPlayerPlay,
  IconRefresh,
  IconSearch,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import * as API from "../api";
import UploadDialog from "../components/UploadDialog";
import { Link } from "@tanstack/react-router";

function StatusBadge({ s }) {
  const color =
    s === "completed"
      ? "green"
      : s === "processing" || s === "queued"
      ? "yellow"
      : s === "failed"
      ? "red"
      : "gray";
  return (
    <Badge color={color} variant="light">
      {s || "uploaded"}
    </Badge>
  );
}

// tiny helper for a nice placeholder when img_url is missing
function ThumbFallback({ fileName }) {
  return (
    <div
      style={{
        height: 160,
        background:
          "repeating-linear-gradient(135deg,#f2f2f2,#f2f2f2 12px,#e9e9e9 12px,#e9e9e9 24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
        fontSize: 12,
        padding: "0 12px",
        textAlign: "center",
      }}
    >
      {fileName}
    </div>
  );
}

export default function VideosPage() {
  const qc = useQueryClient();

  const DEFAULT_PAGE_SIZE = (() => {
    const raw = import.meta.env.VITE_DEFAULT_PAGE_SIZE || "20";
    const n = parseInt(typeof raw === "string" ? raw : "", 10);
    return Number.isFinite(n) && n > 0 ? n : 20;
  })();

  const [cursorStack, setCursorStack] = useState([]);
  const currentCursor = cursorStack[cursorStack.length - 1];

  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState("createdAt:desc");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [open, setOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["videos", currentCursor ?? null, limit, sort, q, statusFilter],
    queryFn: () =>
      API.listVideos({
        cursor: currentCursor,
        limit,
        sort,
        q,
        filter: statusFilter,
      }),
    keepPreviousData: true,
    staleTime: 5_000,
  });

  const canPrev = cursorStack.length > 0;
  const canNext = !!data?.pagination?.cursor;

  function resetPagination() {
    setCursorStack([]);
  }

  function goPrev() {
    if (!canPrev) return;
    setCursorStack((s) => s.slice(0, -1));
  }

  function goNext() {
    const nextCursorObj = data?.pagination?.cursor;
    if (!nextCursorObj) return;
    const json = JSON.stringify(nextCursorObj);
    setCursorStack((s) => [...s, json]);
  }

  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>My videos</Title>
        <Group>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={() => setOpen(true)}
          >
            Upload
          </Button>
        </Group>
      </Group>

      <Group>
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Filter by text…"
          value={q}
          onChange={(e) => {
            setQ(e.currentTarget.value);
            resetPagination();
          }}
        />
        <Select
          data={[
            { value: "", label: "All statuses" },
            { value: "transcode_status:completed", label: "Completed" },
            { value: "transcode_status:processing", label: "Processing" },
            { value: "transcode_status:queued", label: "Queued" },
            { value: "transcode_status:failed", label: "Failed" },
          ]}
          value={statusFilter ?? ""}
          onChange={(v) => {
            setStatusFilter(v || undefined);
            resetPagination();
          }}
          label="Filter"
          w={220}
        />
        <Select
          data={[
            { value: "createdAt:desc", label: "Newest" },
            { value: "createdAt:asc", label: "Oldest" },
            { value: "fileName:asc", label: "Name A→Z" },
            { value: "fileName:desc", label: "Name Z→A" },
          ]}
          value={sort}
          onChange={(v) => {
            setSort(v);
            resetPagination();
          }}
          label="Sort"
          w={220}
        />
        <Select
          data={[2, 5, 10, 20].map((n) => ({
            value: String(n),
            label: `${n}/page`,
          }))}
          value={String(limit)}
          onChange={(v) => {
            const next = v ? parseInt(v, 10) : limit;
            if (!Number.isFinite(next) || next <= 0 || next === limit) return;
            setLimit(next);
            resetPagination();
          }}
          label="Page size"
          w={140}
        />
        <ActionIcon
          variant="light"
          onClick={() => {
            resetPagination();
            qc.invalidateQueries({ queryKey: ["videos"] });
          }}
          loading={isFetching}
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {data?.videos?.map((v) => {
          const isDone = v?.transcode_status === "completed";
          return (
            <Card key={v.videoId} withBorder padding="sm" radius="md">
              {/* Thumbnail with completed check overlay */}
              <div style={{ position: "relative" }}>
                {v.img_url ? (
                  <Image
                    src={v.img_url}
                    h={160}
                    fit="cover"
                    radius="sm"
                    alt={v.fileName}
                    fallbackSrc="" // Mantine shows nothing on error; we provide a custom fallback below
                    styles={{ image: { objectPosition: "center" } }}
                  />
                ) : (
                  <ThumbFallback fileName={v.fileName} />
                )}

                {isDone && (
                  <div
                    title="Transcoded"
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      background: "rgba(34,197,94,0.9)", // green-500-ish
                      color: "white",
                      borderRadius: 999,
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                  >
                    <IconCheck size={18} />
                  </div>
                )}
              </div>

              <Group justify="space-between" mt="sm" mb="xs">
                <Text fw={600} lineClamp={1} title={v.fileName}>
                  {v.fileName}
                </Text>
                <StatusBadge s={v.transcode_status} />
              </Group>

              {v.title && <Text>{v.title}</Text>}
              {v.description && (
                <Text c="dimmed" size="sm" lineClamp={2}>
                  {v.description}
                </Text>
              )}

              <Group mt="sm" justify="space-between">
                <Button
                  component={Link}
                  to="/videos/$videoId"
                  params={{ videoId: v.videoId }}
                  size="xs"
                  variant="subtle"
                >
                  Open
                </Button>
                <Tooltip label="Start (re)transcode">
                  <ActionIcon
                    onClick={async () => {
                      await API.startTranscode(v.videoId);
                      qc.invalidateQueries({ queryKey: ["videos"] });
                    }}
                    variant="light"
                  >
                    <IconPlayerPlay size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Cursor controls */}
      <Group justify="center" mt="md">
        <Button variant="default" onClick={goPrev} disabled={!canPrev}>
          Previous
        </Button>
        <Button onClick={goNext} disabled={!canNext}>
          Next
        </Button>
      </Group>

      <UploadDialog
        opened={open}
        onClose={() => setOpen(false)}
        onDone={() => {
          resetPagination();
          qc.invalidateQueries({ queryKey: ["videos"] });
        }}
      />
    </Stack>
  );
}
