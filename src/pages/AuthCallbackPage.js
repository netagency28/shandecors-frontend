import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (!accessToken) {
        setError('Invalid or expired confirmation link. Please sign up again or contact support.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        setError('Invalid or expired confirmation link. Please sign up again or contact support.');
        return;
      }

      if (accessToken) {
        localStorage.setItem('supabase_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('supabase_refresh_token', refreshToken);
      }

      if (type === 'recovery') {
        window.location.replace('/reset-password');
        return;
      }

      // Full reload so AuthContext picks up the new session from localStorage
      window.location.replace('/');
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm text-center">
        {error ? (
          <>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to Login
            </button>
          </>
        ) : (
          <p className="text-gray-600 text-sm">Verifying your account...</p>
        )}
      </div>
    </div>
  );
}
