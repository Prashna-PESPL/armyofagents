import React, { Suspense } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import { useHMRConnection } from '../hooks/useHMRConnection';

export function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isConnected = useHMRConnection();

  return (
    <div className="min-h-screen bg-space-black">
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center">
          Development server connection lost. Waiting for reconnection...
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-space-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-pulse text-electric-blue text-xl">Loading...</div>
        </div>
      )}
      <Suspense fallback={
        <div className="min-h-screen bg-space-black flex items-center justify-center">
          <div className="animate-pulse text-electric-blue text-xl">Loading...</div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  );
} 