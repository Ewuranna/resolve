'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const code = searchParams.get('code');
        
        if (code) {
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code);
        }
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            // Store user data in localStorage
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          }
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/signin?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white font-['Quicksand'] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6d71] mx-auto mb-4"></div>
        <p className="text-gray-600">Confirming your account...</p>
      </div>
    </div>
  );
}