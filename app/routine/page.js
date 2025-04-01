'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Routine() {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  // Add a state for completions
  const [completions, setCompletions] = useState([]);
  
  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get current day index (0 = Monday, 6 = Sunday)
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0 format
  
  // Add state for week offset (0 = current week, -1 = last week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Add a refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    // In the fetchHabits function
    const fetchHabits = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/signin');
          return;
        }
        
        // Fetch all habits for the user
        const { data, error } = await supabase
          .from('habits')
          .select(`
            *,
            goals (id, name, icon, category)
          `)
          .eq('user_id', session.user.id);
          
        if (error) {
          throw new Error(error.message);
        }
        
        // For each day in the week, fetch habit completions
        const habitsWithCompletions = [...data];
        
        // Get date range for the current week view
        const startDate = getDateForDay(0); // First day of the week
        const endDate = getDateForDay(6);   // Last day of the week
        
        // Format dates for query
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fetch all completions for this date range
        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*')
          .gte('date', startDateStr)
          .lte('date', endDateStr);
          
        if (completionsError) {
          throw new Error(completionsError.message);
        }
        
        console.log('Fetched habits:', data);
        console.log('Fetched completions:', completionsData);
        
        // Store the habits and completions in state
        setHabits(habitsWithCompletions || []);
        setCompletions(completionsData || []);
        
        // Store user info
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        }
        
      } catch (error) {
        console.error('Error fetching habits:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabits();
  }, [router, weekOffset, refreshTrigger]); // Add refreshTrigger to dependencies
  
  // Function to determine if a habit should be done on a specific day
  const shouldDoHabitOnDay = (habit, dayIndex) => {
    if (habit.frequency === 'daily') {
      return true;
    } else if (habit.frequency === 'weekly') {
      // For weekly habits, check if the day matches
      // Assuming habit.frequency_details contains the day index (0-6)
      return habit.frequency_details === dayIndex.toString();
    } else if (habit.frequency === 'custom') {
      // For custom frequency, check if the day is in the frequency_details array
      try {
        const frequencyDetails = JSON.parse(habit.frequency_details || '[]');
        return frequencyDetails.includes(dayIndex.toString());
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  
  // Get the date for a specific day in the selected week
  const getDateForDay = (dayIndex) => {
    const date = new Date();
    const diff = dayIndex - currentDayIndex + (weekOffset * 7);
    date.setDate(date.getDate() + diff);
    return date;
  };
  
  // Format date as "Month Day" (e.g., "May 15")
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Group habits by day
  const habitsByDay = daysOfWeek.map((day, dayIndex) => {
    return {
      day,
      date: getDateForDay(dayIndex),
      isToday: dayIndex === currentDayIndex && weekOffset === 0,
      habits: habits.filter(habit => shouldDoHabitOnDay(habit, dayIndex))
    };
  });
  
  // Reorder days to start with today and follow with next days
  const orderedDays = [];
  for (let i = 0; i < 7; i++) {
    const index = (currentDayIndex + i) % 7;
    orderedDays.push(habitsByDay[index]);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} user={user} />
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Weekly Routine</h1>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="flex items-center px-3 py-1.5 text-sm text-[#3c6d71] border border-[#3c6d71] rounded-lg hover:bg-[#3c6d71]/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous Week
            </button>
            
            <div className="text-sm font-medium">
              {weekOffset === 0 ? 'This Week' : 
               weekOffset < 0 ? `${Math.abs(weekOffset)} ${Math.abs(weekOffset) === 1 ? 'Week' : 'Weeks'} Ago` : 
               `${weekOffset} ${weekOffset === 1 ? 'Week' : 'Weeks'} Ahead`}
            </div>
            
            <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="flex items-center px-3 py-1.5 text-sm text-[#3c6d71] border border-[#3c6d71] rounded-lg hover:bg-[#3c6d71]/10"
            >
              Next Week
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3c6d71]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {orderedDays.map(({ day, date, isToday, habits }) => (
              <div 
                key={day} 
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  isToday ? 'border-[#3c6d71] ring-2 ring-[#3c6d71]/20' : 'border-gray-100'
                }`}
              >
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
                  isToday ? 'border-[#3c6d71]' : 'border-gray-100'
                }`}>
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      isToday ? 'text-[#3c6d71]' : 'text-gray-700'
                    }`}>
                      {day}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(date)}
                    </div>
                  </div>
                  {isToday && (
                    <span className="text-sm bg-[#3c6d71] text-white px-3 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                
                {/* Rest of the day box content remains the same */}
                {habits.length === 0 ? (
                  <div className="text-center text-gray-400 py-6 text-sm">
                    No habits scheduled for this day
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.map(habit => {
                      // Check if there's a completion for this habit on this specific day
                      const habitDate = date.toISOString().split('T')[0];
                      const completion = completions.find(c => 
                        c.habit_id === habit.id && c.date === habitDate
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
                              {isToday && weekOffset === 0 ? (
                                // Inside the button onClick handler, after updating the habit completion
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    console.log('Habit checkbox clicked:', habit.id, 'Current value:', currentValue, 'Target value:', habit.target_value);
                                    
                                    try {
                                      // Set a default target value if it's undefined
                                      const targetValue = habit.target_value || 1;
                                      
                                      // Toggle between 0 and target_value
                                      const newValue = currentValue >= targetValue ? 0 : targetValue;
                                      console.log('Setting new value to:', newValue);
                                      
                                      // Get the current date in ISO format (YYYY-MM-DD)
                                      const currentDate = date.toISOString().split('T')[0];
                                      
                                      // Instead of updating the habit directly, use the habit_completions table
                                      if (newValue > 0) {
                                        // Insert or update a completion record for this habit on this date
                                        const { data, error: completionError } = await supabase
                                          .from('habit_completions')
                                          .upsert({ 
                                            habit_id: habit.id,
                                            date: currentDate,
                                            value: newValue,
                                            created_at: new Date().toISOString()
                                          })
                                          .select();
                                          
                                        if (completionError) {
                                          console.error('Habit completion error:', completionError);
                                          throw completionError;
                                        }
                                      } else {
                                        // If toggling off, delete the completion record for this date
                                        const { error: deleteError } = await supabase
                                          .from('habit_completions')
                                          .delete()
                                          .eq('habit_id', habit.id)
                                          .eq('date', currentDate);
                                          
                                        if (deleteError) {
                                          console.error('Habit completion delete error:', deleteError);
                                          throw deleteError;
                                        }
                                      }
                                      
                                      // Update goal progress if this habit is associated with a goal
                                      if (habit.goal_id) {
                                        try {
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
                                          
                                          // Get all completions for these habits (not just for today)
                                          const habitIds = goalHabits.map(h => h.id);
                                          const { data: habitCompletions, error: completionsError } = await supabase
                                            .from('habit_completions')
                                            .select('*')
                                            .in('habit_id', habitIds);
                                            
                                          if (completionsError) throw completionsError;
                                          
                                          console.log('Goal data:', goalData);
                                          console.log('Goal habits:', goalHabits);
                                          console.log('All habit completions:', habitCompletions);
                                          
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
                                            console.log('Numeric goal progress:', totalValue, '/', goalData.goal_value, '=', progressPercentage + '%');
                                          } else {
                                            // For non-numeric goals, calculate based on habit completion rate
                                            const totalHabits = goalHabits.length;
                                            const completedHabits = habitCompletions.length;
                                            
                                            if (totalHabits > 0) {
                                              progressPercentage = Math.min(Math.round((completedHabits / totalHabits) * 100), 100);
                                            }
                                            console.log('Non-numeric goal progress:', completedHabits, '/', totalHabits, '=', progressPercentage + '%');
                                          }
                                          
                                          // Update goal progress
                                          const { error: goalUpdateError } = await supabase
                                            .from('goals')
                                            .update({ 
                                              progress: progressPercentage,
                                              current_value: goalData.goal_value ? (progressPercentage / 100) * goalData.goal_value : 0
                                            })
                                            .eq('id', habit.goal_id);
                                            
                                          if (goalUpdateError) throw goalUpdateError;
                                          
                                          console.log('Updated goal progress to:', progressPercentage + '%');
                                        } catch (error) {
                                          console.error('Error updating goal progress:', error);
                                        }
                                      }
                                      
                                      // Trigger a refresh after successful update
                                      setRefreshTrigger(prev => prev + 1);
                                      
                                    } catch (error) {
                                      console.error('Error updating habit:', error);
                                      alert('Failed to update habit: ' + error.message);
                                    }
                                  }}
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
                              ) : (
                                <div className={`w-6 h-6 rounded-full border ${
                                  currentValue > 0 
                                    ? 'bg-[#3c6d71] border-[#3c6d71] text-white' 
                                    : 'border-gray-300'
                                } flex items-center justify-center`}>
                                  {currentValue > 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
