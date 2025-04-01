'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

// Create a client component that safely uses useSearchParams
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and next parameters from URL
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';

        if (code) {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          // Get user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error, which is fine for new users
            console.error('Error fetching profile:', profileError);
          }
          
          // Store user profile in localStorage
          if (profileData) {
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          } else {
            // If no profile exists, create a default one with the user's email
            const defaultProfile = {
              id: data.session.user.id,
              email: data.session.user.email,
              full_name: data.session.user.user_metadata?.full_name || '',
              avatar_url: data.session.user.user_metadata?.avatar_url || '',
            };
            
            localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
            
            // Create profile in database
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([defaultProfile]);
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }
          
          // Redirect to the dashboard or specified next URL
          router.push(next);
        }
      } catch (err) {
        console.error('Error during authentication:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full bg-[#3c6d71] text-white py-2 rounded-lg hover:bg-[#3c6d71]/90 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3c6d71] mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}

// Main component that wraps the callback handler with Suspense
export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3c6d71] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}