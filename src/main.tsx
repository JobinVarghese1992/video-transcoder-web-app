import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AuthProvider, useAuth } from '@/auth';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient(); // ✅ semicolon
const router = createRouter({ routeTree }); // ✅ semicolon

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppBody() {
  const auth = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <Notifications position="top-right" />
        {/* ✅ Pass auth state into router so guards can see it */}
        <RouterProvider router={router} context={{ authed: auth.isAuthed }} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppBody />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);