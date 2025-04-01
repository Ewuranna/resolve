'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Authenticate with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Login error details:', signInError);
        throw new Error(signInError.message || 'Failed to sign in');
      }
      
      if (data && data.user) {
        console.log('Sign in successful:', data.user);
        
        // Store user profile in localStorage for app-wide access
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }
        
        // Store user data in localStorage
        localStorage.setItem('userProfile', JSON.stringify(profileData || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email.split('@')[0]
        }));
        
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        throw new Error('No user data returned after sign in');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white font-['Quicksand']">
      <Navbar />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-6 py-12 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Image 
              src="/resolve logo.png" 
              alt="Resolve Logo" 
              width={120} 
              height={40} 
              className="h-10 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c6d71] focus:border-transparent outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-[#3c6d71] hover:text-[#3c6d71]/80">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c6d71] focus:border-transparent outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3c6d71] text-white py-3 rounded-lg hover:bg-[#3c6d71]/90 transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#3c6d71] font-medium hover:text-[#3c6d71]/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}