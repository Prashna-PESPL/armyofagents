import React, { useEffect, useState } from 'react';

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase configuration');
        }

        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Supabase connection successful!');
        setStatus('success');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-space-black text-white">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      {status === 'checking' && (
        <div className="text-electric-blue">Checking connection...</div>
      )}
      {status === 'success' && (
        <div className="text-green-500">✅ Connection successful!</div>
      )}
      {status === 'error' && (
        <div className="text-red-500">
          ❌ Connection failed: {error}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest; 