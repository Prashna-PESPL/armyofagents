import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RootLayout } from './components/RootLayout';

// Add error handling for lazy imports
const HomePage = lazy(() => import('./pages/HomePage').catch((error) => {
  console.error('Error loading HomePage:', error);
  throw error;
}));

const BFFBotPage = lazy(() => import('./pages/BFFBotPage').catch((error) => {
  console.error('Error loading BFFBotPage:', error);
  throw error;
}));

const LoadingFallback = () => (
  <div className="min-h-screen bg-space-black flex items-center justify-center">
    <div className="animate-pulse text-electric-blue text-xl">Loading...</div>
  </div>
);

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'home-page',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'bff-agent',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BFFBotPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true
  }
}); 