'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../utils/supabase';

// Create a client component that safely uses useSearchParams
function HabitFormWithSearchParams() {
  const searchParams = useSearchParams();
  const goalId = searchParams.get('goalId');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6], // Default to all days selected
    goal_id: goalId || '',
    target_value: 1,
    target_unit: '',
    custom_frequency: {
      interval: 1,
      period: 'days'
    }
  });

  // Rest of your component logic here
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/signin');
          return;
        }
        
        const storedProfile = localStorage.getItem('userProfile');
        
        if (!storedProfile) {
          router.push('/signin');
          return;
        }
        
        const userProfile = JSON.parse(storedProfile);
        setUser(userProfile);
        
        // Fetch goals for dropdown
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (goalsError) {
          console.error('Error fetching goals:', goalsError);
        } else {
          setGoals(goalsData || []);
          
          // If goalId is provided and exists in the fetched goals, set it in the form
          if (goalId) {
            const goalExists = goalsData.some(goal => goal.id === goalId);
            if (goalExists) {
              setFormData(prev => ({ ...prev, goal_id: goalId }));
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/signin');
      }
    };
    
    checkAuth();
  }, [router, goalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDayToggle = (dayIndex) => {
    setFormData(prev => {
      const currentDays = [...prev.days];
      
      if (currentDays.includes(dayIndex)) {
        // Remove day if already selected
        return { ...prev, days: currentDays.filter(day => day !== dayIndex) };
      } else {
        // Add day if not selected
        return { ...prev, days: [...currentDays, dayIndex].sort() };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a habit name');
      return;
    }
    
    if (formData.frequency === 'weekly' && formData.days.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get the user's ID from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Prepare the habit data based on frequency type
      const habitData = {
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        user_id: session.user.id,
        goal_id: formData.goal_id || null,
        target_value: formData.target_value || 1,
        unit: formData.target_unit || '', // Changed from target_unit to unit
        created_at: new Date().toISOString()
      };
      
      // Add frequency-specific data
      if (formData.frequency === 'weekly') {
        habitData.frequency_data = { days: formData.days };
      } else if (formData.frequency === 'monthly') {
        habitData.frequency_data = { day: formData.monthlyDay || 1 };
      } else if (formData.frequency === 'custom') {
        habitData.frequency_data = formData.custom_frequency;
      }
      
      // Create the habit
      const { data: habit, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Redirect to the dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6d71]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-[#3c6d71] hover:underline mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Habit</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Habit Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                placeholder="e.g., Morning Meditation"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                placeholder="e.g., 10 minutes of mindfulness meditation each morning"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label htmlFor="goal_id" className="block text-gray-700 font-medium mb-2">Associated Goal (Optional)</label>
              <select
                id="goal_id"
                name="goal_id"
                value={formData.goal_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
              >
                <option value="">None</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="frequency" className="block text-gray-700 font-medium mb-2">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {formData.frequency === 'weekly' && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Days of the Week</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.days.includes(index)
                          ? 'bg-[#3c6d71] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {formData.frequency === 'monthly' && (
              <div className="mb-6">
                <label htmlFor="monthlyDay" className="block text-gray-700 font-medium mb-2">Day of Month</label>
                <select
                  id="monthlyDay"
                  name="monthlyDay"
                  value={formData.monthlyDay || 1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.frequency === 'custom' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-gray-700 font-medium mb-2">Custom Frequency</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Every</span>
                  <input
                    type="number"
                    name="custom_frequency.interval"
                    value={formData.custom_frequency.interval}
                    onChange={(e) => setFormData({
                      ...formData,
                      custom_frequency: {
                        ...formData.custom_frequency,
                        interval: parseInt(e.target.value) || 1
                      }
                    })}
                    min="1"
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                  />
                  <select
                    name="custom_frequency.period"
                    value={formData.custom_frequency.period}
                    onChange={(e) => setFormData({
                      ...formData,
                      custom_frequency: {
                        ...formData.custom_frequency,
                        period: e.target.value
                      }
                    })}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="target_value" className="block text-gray-700 font-medium mb-2">
                Target Value
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="target_value"
                  name="target_value"
                  value={formData.target_value}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                />
                <input
                  type="text"
                  id="target_unit"
                  name="target_unit"
                  value={formData.target_unit}
                  onChange={handleChange}
                  placeholder="units (e.g., minutes, pages)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {submitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Main component that wraps the form with Suspense
export default function NewHabitPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-quicksand">
      <Navbar isAuthenticated={true} />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6d71]"></div>
        </div>
      }>
        <HabitFormWithSearchParams />
      </Suspense>
    </div>
  );
}