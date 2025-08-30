// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routes';
import { AuthProvider, useAuth } from '@/auth';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// ---- TanStack Router typed context ----
type RouterContext = { authed: boolean };

const queryClient = new QueryClient();

// Provide a default context value here to satisfy TS.
// The real value is supplied at runtime via <RouterProvider context={...} />.
const router = createRouter({
  routeTree,
  context: { authed: false } as RouterContext,
});

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
        <RouterProvider
          key={auth.isAuthed ? 'authed' : 'guest'}
          router={router}
          context={{ authed: auth.isAuthed }}
        />
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
