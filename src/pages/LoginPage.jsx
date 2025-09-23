// src/pages/LoginPage.jsx
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { login } from "../api";

export default function LoginPage() {
  const nav = useNavigate();
  const { isAuthed } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Navigate only after auth state actually flips to true
  useEffect(() => {
    if (isAuthed) {
      nav({ to: "/" }); // or replace: true if you prefer
    }
  }, [isAuthed, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const j = await login(username, password);
      if (j.success === true) {
        nav({
          to: "/confirmauth",
          search: { username: username, signup: false, session: j.session },
        });
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack align="center" justify="center" style={{ height: "80vh" }}>
      <Card w={380} withBorder>
        <Title order={3} mb="md">
          Sign in
        </Title>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setU(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setP(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={loading}>
              Login
            </Button>
            <Link
              style={{ display: "flex", justifyContent: "center" }}
              to="/register"
            >
              Don't have an account? Register
            </Link>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
