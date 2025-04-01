'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Habits() {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingHabit, setUpdatingHabit] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/signin');
          return;
        }

        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select(`
            *,
            goals (id, name, icon)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (habitsError) {
          throw new Error(habitsError.message);
        }

        setHabits(habitsData);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [router]);

  const trackHabitProgress = async (habit, value) => {
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
      setHabits(habits.map(h => 
        h.id === habit.id ? {...h, current_value: newValue} : h
      ));
      
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit: ' + error.message);
    } finally {
      setUpdatingHabit(false);
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Habits</h1>
          <Link 
            href="/goals"
            className="px-4 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors"
          >
            View Goals
          </Link>
        </div>
        
        {habits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't created any habits yet.</p>
            <Link 
              href="/goals"
              className="inline-flex items-center text-[#3c6d71] hover:underline"
            >
              Go to your goals to add habits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <div 
                key={habit.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{habit.name}</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      {habit.frequency}
                    </span>
                  </div>
                  
                  {habit.description && (
                    <p className="text-gray-600 mb-4">{habit.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{habit.current_value} / {habit.target_value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#3c6d71] h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(habit.current_value / habit.target_value) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/goals/${habit.goal_id}`}
                      className="flex items-center text-sm text-gray-500 hover:text-[#3c6d71]"
                    >
                      <span className="mr-1">{habit.goals.icon}</span>
                      <span>{habit.goals.name}</span>
                    </Link>
                    
                    <button
                      onClick={() => trackHabitProgress(habit, 1)}
                      disabled={updatingHabit || habit.current_value >= habit.target_value}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#3c6d71] text-white hover:bg-[#3c6d71]/90 transition-colors disabled:opacity-50"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}