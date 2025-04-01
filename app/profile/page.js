'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // In your fetchUserProfile function
  
  useEffect(() => {
    // Check if user is authenticated and fetch profile data
    const fetchUserProfile = async () => {
      try {
        // First check localStorage for user data
        const storedProfile = localStorage.getItem('userProfile');
        
        if (!storedProfile) {
          // If no local storage data, try to get session from Supabase
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            router.push('/signin');
            return;
          }
          
          const userId = sessionData.session.user.id;
          // Continue with fetching profile...
        } else {
          // Use the stored profile data
          const userProfile = JSON.parse(storedProfile);
          setUser(userProfile);
          
          // Also fetch the latest data from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userProfile.id)
            .single();
            
          if (!profileError && profileData) {
            setProfile(profileData);
            setFormData({
              name: profileData.name || '',
              email: profileData.email || '',
            });
          } else {
            // If there's an error fetching from Supabase, use localStorage data
            setProfile(userProfile);
            setFormData({
              name: userProfile.name || '',
              email: userProfile.email || '',
            });
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          updated_at: new Date(),
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local storage
      const updatedProfile = {
        ...profile,
        name: formData.name,
      };
      
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Quicksand'] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6d71]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} user={profile} />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-[#3c6d71] hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="flex items-center pb-6 border-b border-gray-100">
                <div className="h-20 w-20 bg-[#3c6d71]/10 rounded-full flex items-center justify-center text-2xl font-bold text-[#3c6d71] mr-4">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{profile?.name}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-sm text-[#3c6d71] mt-1">
                    <span className="font-medium">{profile?.points || 0}</span> points earned
                  </p>
                </div>
              </div>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                />
              </div>
              
              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              {/* Account Stats */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-medium text-gray-800">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-lg font-medium text-gray-800">{profile?.points || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Rewards Redeemed</p>
                    <p className="text-lg font-medium text-gray-800">0</p>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}