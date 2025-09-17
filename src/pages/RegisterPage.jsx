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

export default function RegisterPage() {
  const nav = useNavigate();
  const { login, isAuthed } = useAuth();
  const [name, setN] = useState("");
  const [username, setU] = useState("");
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
      await register(name, username, password);
      notifications.show({
        title: "Welcome",
        message: "Registered successfully",
      });
      // NOTE: no immediate nav here; the effect above will run once isAuthed updates
    } catch (e) {
      notifications.show({
        color: "red",
        title: "Registration failed",
        message: e.message,
      });
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
              label="Name"
              value={name}
              onChange={(e) => setN(e.currentTarget.value)}
              required
            />
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
