'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Streaks() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);

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
        
        // Fetch all habits for the user
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select(`
            *,
            goals (name, icon)
          `)
          .eq('user_id', session.user.id);
          
        if (habitsError) {
          console.error('Error fetching habits:', habitsError);
          throw habitsError;
        }
        
        setHabits(habitsData || []);
        
        // Fetch all completions for these habits
        const habitIds = habitsData.map(h => h.id);
        
        if (habitIds.length > 0) {
          const { data: completionsData, error: completionsError } = await supabase
            .from('habit_completions')
            .select('*')
            .in('habit_id', habitIds)
            .order('date', { ascending: false });
            
          if (completionsError) {
            console.error('Error fetching completions:', completionsError);
            throw completionsError;
          }
          
          // Calculate streaks for each habit
          const habitStreaks = {};
          
          habitsData.forEach(habit => {
            // Get completions for this habit
            const habitCompletions = completionsData.filter(c => c.habit_id === habit.id);
            
            // Sort completions by date (newest first)
            habitCompletions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Calculate current streak
            let currentStreak = 0;
            let longestStreak = 0;
            let lastDate = null;
            
            // Group completions by date
            const completionsByDate = {};
            habitCompletions.forEach(completion => {
              completionsByDate[completion.date] = true;
            });
            
            // Check if there's a completion for today
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const hasCompletionToday = completionsByDate[todayStr];
            
            // Calculate streak
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
            
            // Calculate longest streak
            let tempStreak = 0;
            let prevDate = null;
            
            Object.keys(completionsByDate).sort().forEach(dateStr => {
              const date = new Date(dateStr);
              
              if (!prevDate) {
                tempStreak = 1;
              } else {
                // Check if this date is consecutive with the previous one
                const diffTime = Math.abs(date - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                  tempStreak++;
                } else {
                  tempStreak = 1;
                }
              }
              
              longestStreak = Math.max(longestStreak, tempStreak);
              prevDate = date;
            });
            
            // Store streak data
            habitStreaks[habit.id] = {
              current: currentStreak,
              longest: longestStreak,
              lastCompleted: habitCompletions.length > 0 ? habitCompletions[0].date : null
            };
          });
          
          setStreaks(habitStreaks);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Quicksand'] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6d71]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} user={user} />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-[#3c6d71] hover:underline mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Habit Streaks</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-8">
                You don't have any habits yet. 
                <Link href="/habits/new" className="text-[#3c6d71] hover:underline ml-1">
                  Create your first habit
                </Link>
              </div>
            ) : (
              habits.map(habit => {
                const habitStreak = streaks[habit.id] || { current: 0, longest: 0, lastCompleted: null };
                
                return (
                  <div key={habit.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 bg-[#beef62]/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-[#3c6d71]">{habitStreak.current}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{habit.name}</h3>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#beef62]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600 ml-1">{habitStreak.current} day streak</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Longest Streak</div>
                        <div className="text-xl font-bold text-gray-800 mt-1">{habitStreak.longest} days</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Last Completed</div>
                        <div className="text-xl font-bold text-gray-800 mt-1">
                          {habitStreak.lastCompleted ? new Date(habitStreak.lastCompleted).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>
                    
                    {habit.goal_id && habit.goals && (
                      <div className="mt-4 text-sm">
                        <span className="text-gray-500">Part of goal: </span>
                        <Link href={`/goals/${habit.goal_id}`} className="text-[#3c6d71] hover:underline">
                          {habit.goals.name}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Streak Tips</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-semibold">Consistency is key:</span> Try to complete your habits at the same time each day to build a routine.
            </p>
            <p>
              <span className="font-semibold">Don't break the chain:</span> Maintaining your streak creates momentum and makes habits easier to stick to.
            </p>
            <p>
              <span className="font-semibold">Start small:</span> Focus on consistency rather than perfection. Even small steps count toward your streak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}