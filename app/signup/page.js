'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Add the missing success state
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (signUpError) {
        console.error('Sign up error details:', signUpError);
        throw new Error(signUpError.message || 'Failed to sign up');
      }
      
      if (data && data.user) {
        console.log('Sign up successful:', data.user);
        
        // Get the current session to ensure we have valid auth for RLS
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Try to sign in to get a valid session
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error('Error signing in after signup:', signInError);
          }
        }
        
        // Create a profile record with the authenticated session
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: name,
            },
          ]);
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          console.error('Error code:', profileError.code);
          console.error('Error message:', profileError.message);
          console.error('Error details:', profileError.details);
          
          // Continue even if profile creation fails - we'll handle it on the dashboard
          setSuccess('Account created! Redirecting to dashboard...');
        } else {
          setSuccess('Account created successfully!');
        }
        
        // Store user data in localStorage
        localStorage.setItem('userProfile', JSON.stringify({
          id: data.user.id,
          email: email,
          name: name
        }));
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        throw new Error('No user data returned after sign up');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Quicksand']">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <img
            className="mx-auto h-12 w-auto"
            src="/resolve logo.png"
            alt="Resolve"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/signin" className="font-medium text-[#3c6d71] hover:text-[#3c6d71]/80">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3c6d71] focus:border-[#3c6d71] sm:text-sm"
                />
              </div>
            </div>
          
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3c6d71] focus:border-[#3c6d71] sm:text-sm"
                />
              </div>
            </div>
          
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3c6d71] focus:border-[#3c6d71] sm:text-sm"
                />
              </div>
            </div>
          
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3c6d71] hover:bg-[#3c6d71]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c6d71] disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}