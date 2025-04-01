'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../utils/supabase';

export default function Habit({ params }) {
  const router = useRouter();
  const [habit, setHabit] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingHabit, setUpdatingHabit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    frequency: '',
    target_value: 0
  });

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/signin');
          return;
        }

        const { data: habitData, error: habitError } = await supabase
          .from('habits')
          .select(`
            *,
            goals (*)
          `)
          .eq('id', params.id)
          .single();

        if (habitError) {
          throw new Error(habitError.message);
        }

        if (!habitData) {
          throw new Error('Habit not found');
        }

        // Verify user owns this habit
        if (habitData.user_id !== session.user.id) {
          throw new Error('Unauthorized');
        }

        setHabit(habitData);
        setGoal(habitData.goals);
      } catch (error) {
        console.error('Error fetching habit:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHabit();
    }
  }, [params.id, router]);

  useEffect(() => {
    if (habit) {
      setEditForm({
        name: habit.name,
        description: habit.description || '',
        frequency: habit.frequency,
        target_value: habit.target_value
      });
    }
  }, [habit]);

  const trackHabitProgress = async (value) => {
    if (updatingHabit) return;
    
    setUpdatingHabit(true);
    try {
      const newValue = Math.min(habit.target_value, habit.current_value + value);
      
      // Update habit
      const { error: habitError } = await supabase
        .from('habits')
        .update({ 
          current_value: newValue,
          last_completed: new Date().toISOString()
        })
        .eq('id', habit.id);
        
      if (habitError) {
        throw new Error(habitError.message);
      }
      
      // Update local state
      setHabit({
        ...habit,
        current_value: newValue
      });
      
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit: ' + error.message);
    } finally {
      setUpdatingHabit(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          name: editForm.name,
          description: editForm.description,
          frequency: editForm.frequency,
          target_value: editForm.target_value
        })
        .eq('id', habit.id);

      if (error) throw error;

      // Update local state
      setHabit({ ...habit, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-['Quicksand']">
        <Navbar isAuthenticated={true} />
        <div className="pt-20"></div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3c6d71]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-['Quicksand']">
        <Navbar isAuthenticated={true} />
        <div className="pt-20"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} />
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {habit && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <Link href={`/goals/${habit.goal_id}`} className="text-[#3c6d71] hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Goal
              </Link>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-[#3c6d71] hover:bg-[#3c6d71]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {isEditing ? 'Cancel Edit' : 'Edit Habit'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {!isEditing ? (
                <>
                  <div className="bg-gradient-to-r from-[#3c6d71]/10 to-[#3c6d71]/5 p-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800">{habit.name}</h1>
                        <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-[#3c6d71]/10 text-[#3c6d71]">
                          {habit.frequency}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Goal</div>
                        <Link href={`/goals/${habit.goal_id}`} className="font-medium hover:text-[#3c6d71] flex items-center justify-end">
                          <span className="mr-1">{goal?.icon}</span>
                          <span>{goal?.name}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">Progress</h2>
                      <div className="text-lg font-bold text-[#3c6d71]">
                        {habit.current_value} / {habit.target_value}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-[#3c6d71] h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${(habit.current_value / habit.target_value) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => trackHabitProgress(1)}
                        disabled={updatingHabit || habit.current_value >= habit.target_value}
                        className="px-4 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors disabled:opacity-50"
                      >
                        {updatingHabit ? 'Updating...' : 'Track Progress'}
                      </button>
                    </div>
                  </div>

                  {habit.description && (
                    <div className="p-8 border-b border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                      <p className="text-gray-600 whitespace-pre-line">{habit.description}</p>
                    </div>
                  )}

                  <div className="p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Last Completed</div>
                        <div className="font-medium">
                          {habit.last_completed ? new Date(habit.last_completed).toLocaleDateString() : 'Not yet completed'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Current Streak</div>
                        <div className="font-medium">{habit.streak || 0} days</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Created On</div>
                        <div className="font-medium">{new Date(habit.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Habit</h2>
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Habit Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={editForm.frequency}
                          onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={editForm.target_value}
                          onChange={(e) => setEditForm({ ...editForm, target_value: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}