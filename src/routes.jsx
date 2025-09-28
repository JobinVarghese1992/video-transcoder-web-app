import {
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { AppShell, Burger, Group, Title, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "./auth";
import LoginPage from "./pages/LoginPage";
import VideosPage from "./pages/VideosPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import RegisterPage from "./pages/RegisterPage";
import ConfirmAuth from "./pages/ConfirmAuth";
import OAuthloader from "./pages/OAuthloader";

export const rootRoute = createRootRoute({
  component: function Root() {
    const [opened, { toggle }] = useDisclosure();
    const auth = useAuth();
    const nav = useNavigate();

    return (
      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: 260,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Title
                style={{ cursor: "pointer" }}
                order={3}
                onClick={() => nav({ to: "/" })}
              >
                Video Transcoder
              </Title>
            </Group>
            <Group>
              {auth.isAuthed && (
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => {
                    auth.logout();
                    nav({ to: "/login" });
                  }}
                >
                  Logout
                </Button>
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

function requireAuthed({ context }) {
  if (!context.authed) throw redirect({ to: "/login" });
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireAuthed,
  component: VideosPage,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

export const confirmAuthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmauth",
  component: ConfirmAuth,
});

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

export const OAuthPage = createRoute({
  getParentRoute: () => rootRoute,
  path: "/oauth",
  component: OAuthloader,
});

export const videoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/videos/$videoId",
  beforeLoad: requireAuthed,
  component: VideoDetailPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  RegisterRoute,
  videoDetailRoute,
  confirmAuthRoute,
]);
