'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../utils/supabase';

export default function NewGoal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Update the formData state to include goal_value and goal_unit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Fitness',
    deadline: '',
    icon: '🎯',
    goal_value: 0,
    goal_unit: ''
  });
  
  // Icons for selection
  const iconOptions = [
    '🎯', '🏃‍♂️', '📚', '💰', '🧠', '🗣️', '🎨', '🎵', '🏋️‍♂️', '🧘‍♀️', '🌱', '✈️'
  ];
  
  // Category options
  const categoryOptions = [
    'Fitness', 'Learning', 'Finance', 'Career', 'Health', 'Personal', 'Relationships'
  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const storedProfile = localStorage.getItem('userProfile');
        
        if (!storedProfile) {
          router.push('/signin');
          return;
        }
        
        const userProfile = JSON.parse(storedProfile);
        setUser(userProfile);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/signin');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  // Update the handleSubmit function to include the new fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/signin');
        return;
      }
  
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .insert([
          {
            user_id: session.user.id,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            icon: formData.icon,
            deadline: formData.deadline,
            progress: 0,
            goal_value: parseFloat(formData.goal_value) || 0,
            goal_unit: formData.goal_unit
          }
        ])
        .select();
        
      if (goalError) throw new Error(`Failed to create goal: ${goalError.message}`);
      if (!goalData || goalData.length === 0) {
        throw new Error('Failed to create goal: No data returned');
      }
  
      // Redirect to new habit page with goal ID
      router.push(`/habits/new?goalId=${goalData[0].id}`);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} user={user} />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/goals" className="text-[#3c6d71] hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Goals
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Create New Goal</h1>
          <p className="text-gray-600 mt-1">Set a new goal to track your progress</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                <p>{error}</p>
              </div>
            )}
            
            {/* Goal Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                placeholder="e.g., Run a marathon"
                autoComplete="off"
              />
            </div>
            
            {/* Goal Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to achieve this goal?
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                placeholder="Describe your goal and why it's important to you"
                autoComplete="off"
              ></textarea>
            </div>
            
            {/* Icon Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose an Icon
              </label>
              <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-labelledby="icon-group-label">
                <span id="icon-group-label" className="sr-only">Choose an icon for your goal</span>
                {iconOptions.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleIconSelect(icon)}
                    className={`h-12 w-12 text-2xl flex items-center justify-center rounded-lg ${
                      formData.icon === icon 
                        ? 'bg-[#3c6d71]/20 border-2 border-[#3c6d71]' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-label={`Select icon ${icon}`}
                    aria-pressed={formData.icon === icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                >
                  {categoryOptions.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                />
              </div>
            </div>
            
            {/* Goal Value and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="goal_value" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  id="goal_value"
                  name="goal_value"
                  value={formData.goal_value}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                  placeholder="e.g., 10"
                />
              </div>
              
              <div>
                <label htmlFor="goal_unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit (Optional)
                </label>
                <input
                  type="text"
                  id="goal_unit"
                  name="goal_unit"
                  value={formData.goal_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                  placeholder="e.g., miles, books, pounds"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3c6d71] hover:bg-[#3c6d71]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c6d71] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
