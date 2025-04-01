'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error:', sessionError);
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
        
        // Fetch goals from Supabase
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(4); // Limit to 4 goals for the dashboard
          
        if (goalsError) {
          console.error('Error fetching goals:', goalsError);
        } else {
          console.log('Goals fetched:', goalsData);
          setGoals(goalsData || []);
        }
        
        // Sample data for rewards (unchanged)
        setRewards([
          { id: 1, name: 'Movie night', cost: 500, unlocked: true },
          { id: 2, name: 'New running shoes', cost: 2000, unlocked: false },
          { id: 3, name: 'Weekend trip', cost: 5000, unlocked: false },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/signin');
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch today's habits
  useEffect(() => {
    const fetchTodaysHabits = async () => {
      if (!user) return;
      
      try {
        setLoadingHabits(true);
        
        // Get today's date and day of week
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const adjustedDayIndex = (dayOfWeek + 6) % 7; // Convert to Monday=0 format
        
        // Get all habits for the user
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select(`
            *,
            goals (name, icon)
          `)
          .eq('user_id', user.id);
          
        if (habitsError) throw habitsError;
        
        // Filter habits for today
        const todaysHabits = habitsData.filter(habit => {
          // Check if habit should be done today based on frequency
          if (habit.frequency === 'daily') return true;
          
          if (habit.frequency === 'weekly') {
            // Check if today is one of the selected days
            const daysArray = habit.days || [];
            return daysArray.includes(adjustedDayIndex);
          }
          
          return false;
        });
        
        // Get today's date in ISO format (YYYY-MM-DD)
        const todayStr = today.toISOString().split('T')[0];
        
        // Get all completions for these habits (not just today's)
        const habitIds = habitsData.map(h => h.id);
        
        const { data: allCompletionsData, error: allCompletionsError } = await supabase
          .from('habit_completions')
          .select('*')
          .in('habit_id', habitIds)
          .order('date', { ascending: false });
          
        if (allCompletionsError) throw allCompletionsError;
        
        // Get completions for today only (for habit toggling)
        const { data: todayCompletionsData, error: todayCompletionsError } = await supabase
          .from('habit_completions')
          .select('*')
          .eq('date', todayStr);
          
        if (todayCompletionsError) throw todayCompletionsError;
        
        // Calculate streaks for each habit
        const habitsWithStreaks = todaysHabits.map(habit => {
          // Get completions for this habit
          const habitCompletions = allCompletionsData.filter(c => c.habit_id === habit.id);
          
          // Group completions by date
          const completionsByDate = {};
          habitCompletions.forEach(completion => {
            completionsByDate[completion.date] = true;
          });
          
          // Check if there's a completion for today
          const hasCompletionToday = completionsByDate[todayStr];
          
          // Calculate streak
          let currentStreak = 0;
          let checkDate = new Date(today);
          
          // If there's a completion today, start counting from today
          if (hasCompletionToday) {
            currentStreak = 1;
            
            // Check previous days
            let prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            
            while (completionsByDate[prevDate.toISOString().split('T')[0]]) {
              currentStreak++;
              prevDate.setDate(prevDate.getDate() - 1);
            }
          } else {
            // If no completion today, check if there was one yesterday
            let prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            
            if (completionsByDate[prevDate.toISOString().split('T')[0]]) {
              currentStreak = 1;
              
              // Check days before yesterday
              prevDate.setDate(prevDate.getDate() - 1);
              
              while (completionsByDate[prevDate.toISOString().split('T')[0]]) {
                currentStreak++;
                prevDate.setDate(prevDate.getDate() - 1);
              }
            }
          }
          
          return {
            ...habit,
            streak: currentStreak
          };
        });
        
        setHabits(habitsWithStreaks);
        setCompletions(todayCompletionsData || []);
        
      } catch (error) {
        console.error('Error fetching habits:', error);
      } finally {
        setLoadingHabits(false);
      }
    };
    
    fetchTodaysHabits();
  }, [user, refreshTrigger]);

  // Handle habit completion
  const toggleHabitCompletion = async (habit) => {
    try {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Check if there's a completion for this habit today
      const completion = completions.find(c => 
        c.habit_id === habit.id && c.date === todayStr
      );
      
      // Use the completion value if available, otherwise default to 0
      const currentValue = completion ? completion.value : 0;
      
      // Set a default target value if it's undefined
      const targetValue = habit.target_value || 1;
      
      // Toggle between 0 and target_value
      const newValue = currentValue >= targetValue ? 0 : targetValue;
      
      if (newValue > 0) {
        // Insert or update a completion record for this habit on this date
        const { error: completionError } = await supabase
          .from('habit_completions')
          .upsert({ 
            habit_id: habit.id,
            date: todayStr,
            value: newValue,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (completionError) throw completionError;
      } else {
        // If toggling off, delete the completion record for this date
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habit.id)
          .eq('date', todayStr);
          
        if (deleteError) throw deleteError;
      }
      
      // Update goal progress if this habit is associated with a goal
      if (habit.goal_id) {
        // Get the goal data
        const { data: goalData, error: goalFetchError } = await supabase
          .from('goals')
          .select('*')
          .eq('id', habit.goal_id)
          .single();
          
        if (goalFetchError) throw goalFetchError;
        
        // Get all habits for this goal
        const { data: goalHabits, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('goal_id', habit.goal_id);
          
        if (habitsError) throw habitsError;
        
        // Get all completions for these habits
        const habitIds = goalHabits.map(h => h.id);
        const { data: habitCompletions, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*')
          .in('habit_id', habitIds);
          
        if (completionsError) throw completionsError;
        
        // Calculate progress based on goal's current value vs target value
        let progressPercentage = 0;
        
        if (goalData.goal_type === 'numeric' && goalData.goal_value) {
          // For numeric goals, calculate the sum of all habit completions
          let totalValue = 0;
          
          habitCompletions.forEach(completion => {
            totalValue += completion.value || 0;
          });
          
          // Calculate progress as percentage of target value
          progressPercentage = Math.min(Math.round((totalValue / goalData.goal_value) * 100), 100);
        } else {
          // For non-numeric goals, calculate based on habit completion rate
          const totalHabits = goalHabits.length;
          const completedHabits = habitCompletions.length;
          
          if (totalHabits > 0) {
            progressPercentage = Math.min(Math.round((completedHabits / totalHabits) * 100), 100);
          }
        }
        
        // Update goal progress
        await supabase
          .from('goals')
          .update({ 
            progress: progressPercentage,
            current_value: goalData.goal_value ? (progressPercentage / 100) * goalData.goal_value : 0
          })
          .eq('id', habit.goal_id);
      }
      
      // Refresh the habits list
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      alert('Failed to update habit: ' + error.message);
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
      {/* Pass isAuthenticated prop to Navbar */}
      <Navbar isAuthenticated={true} user={user} />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-600 mt-1">Track your progress and build better habits</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/goals/new" className="px-4 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors">
              New Goal
            </Link>
            <Link href="/habits/new" className="px-4 py-2 bg-[#3c6d71] text-white rounded-lg hover:bg-[#3c6d71]/90 transition-colors">
              New Habit
            </Link>
          </div>
        </div>
        
        {/* Main content and sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="w-full lg:w-3/4">
            {/* Goals Section with Icon Boxes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Goals</h2>
                <Link href="/goals" className="text-sm text-[#3c6d71] hover:underline">
                  View all goals
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goals.map((goal) => (
                  <Link href={`/goals/${goal.id}`} key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl mb-2">{goal.icon}</div>
                      <h3 className="font-medium text-gray-800 mb-1">{goal.name}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-[#3c6d71] h-1.5 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{goal.progress}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Today's Routine Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Routine</h2>
              
              {loadingHabits ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3c6d71]"></div>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  No habits scheduled for today
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map(habit => {
                    // Check if there's a completion for this habit today
                    const today = new Date().toISOString().split('T')[0];
                    const completion = completions.find(c => 
                      c.habit_id === habit.id && c.date === today
                    );
                    
                    // Use the completion value if available, otherwise default to 0
                    const currentValue = completion ? completion.value : 0;
                    
                    return (
                      <div 
                        key={habit.id} 
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleHabitCompletion(habit)}
                              className={`w-6 h-6 rounded-full border ${
                                currentValue > 0 
                                  ? 'bg-[#3c6d71] border-[#3c6d71] text-white' 
                                  : 'border-gray-300'
                              } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#3c6d71]/50`}
                            >
                              {currentValue > 0 && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            
                            <div>
                              <div className="font-medium text-gray-800">{habit.name}</div>
                              {habit.description && (
                                <div className="text-sm text-gray-500 mt-1">{habit.description}</div>
                              )}
                            </div>
                          </div>
                          
                          {habit.goal_id && habit.goals && (
                            <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {habit.goals.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            {/* Streaks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Streaks</h2>
                <Link href="/streaks" className="text-sm text-[#3c6d71] hover:underline">View details</Link>
              </div>
              
              <div className="space-y-6">
                {habits.slice(0, 3).map((habit, index) => (
                  <div key={habit.id || index} className="flex items-center">
                    <div className="h-16 w-16 bg-[#beef62]/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-[#3c6d71]">{habit.streak || 0}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{habit.name}</h3>
                      <div className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#beef62]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600 ml-1">{habit.streak || 0} day streak</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rewards Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Rewards</h2>
                <Link href="/rewards" className="text-sm text-[#3c6d71] hover:underline">View all</Link>
              </div>
              
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 ${reward.unlocked ? 'bg-[#beef62]/20' : 'bg-gray-100'} rounded-full flex items-center justify-center mr-3`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${reward.unlocked ? 'text-[#3c6d71]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{reward.name}</h3>
                        <p className="text-xs text-gray-500">{reward.cost} points</p>
                      </div>
                    </div>
                    <button 
                      className={`px-3 py-1 ${reward.unlocked ? 'bg-[#3c6d71] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-lg text-sm`}
                      disabled={!reward.unlocked}
                    >
                      {reward.unlocked ? 'Redeem' : 'Locked'}
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Points summary */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available points</span>
                  <span className="text-lg font-bold text-[#3c6d71]">750</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
