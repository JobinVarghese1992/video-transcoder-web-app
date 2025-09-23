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
import { register } from "../api";

export default function RegisterPage() {
  const nav = useNavigate();
  const { login, isAuthed } = useAuth();
  const [username, setU] = useState("");
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed) {
      nav({ to: "/" });
    }
  }, [isAuthed, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const j = await register(username, email, password);
      if (j.success === true) {
        nav({
          to: "/confirmauth",
          search: { username: username, signup: true },
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
          Register
        </Title>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setU(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setE(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setP(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={loading}>
              Register
            </Button>
            <Link
              style={{ display: "flex", justifyContent: "center" }}
              to="/login"
            >
              Already have an account? Login
            </Link>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
