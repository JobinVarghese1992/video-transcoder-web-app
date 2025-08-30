// src/pages/LoginPage.tsx
import { useEffect, useState } from 'react';
import { Button, Card, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/auth';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const nav = useNavigate();
  const { login, isAuthed } = useAuth();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Navigate only after auth state actually flips to true
  useEffect(() => {
    if (isAuthed) {
      nav({ to: '/' }); // or replace: true if you prefer
    }
  }, [isAuthed, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      notifications.show({ title: 'Welcome', message: 'Logged in successfully' });
      // NOTE: no immediate nav here; the effect above will run once isAuthed updates
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Login failed', message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack align="center" justify="center" style={{ height: '80vh' }}>
      <Card w={380} withBorder>
        <Title order={3} mb="md">Sign in</Title>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput label="Username" value={username} onChange={(e) => setU(e.currentTarget.value)} required />
            <PasswordInput label="Password" value={password} onChange={(e) => setP(e.currentTarget.value)} required />
            <Button type="submit" loading={loading}>Login</Button>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
