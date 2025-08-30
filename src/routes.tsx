// src/routes.tsx
import { createRootRoute, createRoute, Outlet, redirect, Link, useNavigate } from '@tanstack/react-router';
import { AppShell, Burger, Group, Title, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/auth';
import LoginPage from '@/pages/LoginPage';
import VideosPage from '@/pages/VideosPage';
import VideoDetailPage from '@/pages/VideoDetailPage';

export const rootRoute = createRootRoute({
  component: function Root() {
    const [opened, { toggle }] = useDisclosure();
    const auth = useAuth();
    const nav = useNavigate();

    const appName =
      (typeof window !== 'undefined' && window.__ENV__?.APP_NAME) ||
      import.meta.env.VITE_APP_NAME ||
      'Video Transcoder';

    return (
      <AppShell
        header={{ height: 56 }}
        navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Title order={3}>{appName}</Title>
            </Group>
            <Group>
              {auth.isAuthed ? (
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => {
                    auth.logout();
                    nav({ to: '/login' });
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Link to="/login">
                  <Button size="xs" variant="light">Login</Button>
                </Link>
              )}
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    );
  },
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context.authed) throw redirect({ to: '/login' });
  },
  component: VideosPage,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

export const videoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/videos/$videoId',
  beforeLoad: ({ context }) => {
    if (!context.authed) throw redirect({ to: '/login' });
  },
  component: VideoDetailPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, loginRoute, videoDetailRoute]);
