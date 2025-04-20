import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  console.error('ErrorBoundary caught an error:', error);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
          <button
            onClick={handleGoHome}
            className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
          >
            Go Home
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Error {error.status}</h1>
        <p className="text-gray-400 mb-4">{error.statusText}</p>
        {error.data?.message && (
          <p className="text-gray-400 mb-8">{error.data.message}</p>
        )}
        <button
          onClick={handleGoHome}
          className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                   transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-4">
        {error instanceof Error ? error.message : 'An unexpected error occurred'}
      </p>
      <button
        onClick={handleGoHome}
        className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
      >
        Go Home
      </button>
    </div>
  );
} 