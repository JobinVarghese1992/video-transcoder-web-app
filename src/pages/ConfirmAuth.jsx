import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Stack,
  Title,
  Text,
  PinInput,
} from "@mantine/core";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { confirmSignin, confirmSignup, setToken } from "../api";
import { useAuth } from "../auth";

export default function ConfirmAuth() {
  const { username, signup, session } = useSearch({ from: "/confirmauth" });
  const nav = useNavigate();
  const { settoken } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    try {
      if (signup) {
        const j = await confirmSignup(username, code);
        if (j.success === true) {
          nav({ to: "/login" });
        }
      } else {
        const j = await confirmSignin(username, code, session);
        if (j.success) {
          setToken(j?.data?.idToken);
          settoken(j?.data?.idToken);
          nav({ to: "/" });
        }
      }
    } catch (e) {
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack align="center" justify="center" style={{ minHeight: "70vh" }}>
      <Card
        withBorder
        w={360}
        component="form"
        onSubmit={handleSubmit}
        autoComplete="one-time-code"
      >
        <Stack>
          <Title order={3}>Enter verification code</Title>
          {username && (
            <Text size="sm" c="dimmed">
              We sent a 6-digit code to your email.
            </Text>
          )}
          <Group justify="center">
            <PinInput
              type="number"
              length={6}
              value={code}
              onChange={setCode}
              oneTimeCode
              inputMode="numeric"
              aria-label="One-time passcode"
            />
          </Group>

          <Group justify="space-between">
            <Button type="submit" loading={busy} disabled={code.length !== 6}>
              Verify
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
