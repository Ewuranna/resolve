'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../utils/supabase';

export default function Goal({ params }) {
  const router = useRouter();
  // Use React.use() to unwrap params
  const goalId = typeof params === 'object' ? params.id : use(params).id;
  
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingHabit, setUpdatingHabit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    icon: '',
    deadline: '',
    goal_value: 0,
    goal_unit: ''
  });

  // Inside the fetchGoal function
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/signin');
          return;
        }

        console.log('Fetching goal with ID:', goalId);

        // First, get the goal data
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select(`
            *,
            habits (*)
          `)
          .eq('id', goalId)
          .single();

        console.log('Goal data:', goalData);
        console.log('Goal error:', goalError);
  
        if (goalError) {
          throw new Error(goalError.message);
        }

        if (!goalData) {
          throw new Error('Goal not found');
        }

        // Verify user owns this goal
        if (goalData.user_id !== session.user.id) {
          throw new Error('Unauthorized');
        }

        // Get all habit completions for this goal's habits
        if (goalData.habits && goalData.habits.length > 0) {
          const habitIds = goalData.habits.map(h => h.id);
          
          const { data: completions, error: completionsError } = await supabase
            .from('habit_completions')
            .select('*')
            .in('habit_id', habitIds);
            
          if (completionsError) {
            console.error('Error fetching habit completions:', completionsError);
          } else {
            console.log('Habit completions:', completions);
            
            // Calculate the current value based on completed habits
            let totalCompletedValue = 0;
            
            // Sum up all completion values
            if (completions && completions.length > 0) {
              completions.forEach(completion => {
                totalCompletedValue += completion.value || 0;
              });
            }
            
            // Calculate progress percentage
            const targetValue = goalData.goal_value || 100;
            const progressPercentage = Math.min(Math.round((totalCompletedValue / targetValue) * 100), 100);
            
            console.log('Goal progress calculation:', totalCompletedValue, '/', targetValue, '=', progressPercentage + '%');
            
            // Update the goal with the calculated values
            const { error: updateError } = await supabase
              .from('goals')
              .update({
                current_value: totalCompletedValue,
                progress: progressPercentage
              })
              .eq('id', goalId);
              
            if (updateError) {
              console.error('Error updating goal progress:', updateError);
            } else {
              // Update the local goal data with the new values
              goalData.current_value = totalCompletedValue;
              goalData.progress = progressPercentage;
            }
          }
        }
        
        setGoal(goalData);
        
        // Check if goal has no habits and redirect if needed
        if (goalData && (!goalData.habits || goalData.habits.length === 0) && !isAddingHabit) {
          // Set a flag to prevent infinite redirects
          setIsAddingHabit(true);
          router.push(`/habits/new?goalId=${goalData.id}`);
        }
        
      } catch (error) {
        console.error('Error fetching goal:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (goalId) {
      fetchGoal();
    }
  }, [goalId, router, isAddingHabit]);

  useEffect(() => {
    if (goal) {
      setEditForm({
        name: goal.name,
        description: goal.description,
        category: goal.category,
        icon: goal.icon,
        deadline: goal.deadline,
        goal_value: goal.goal_value || 0,
        goal_unit: goal.goal_unit || ''
      });
    }
  }, [goal]);

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
      
      // Calculate new progress percentage for the goal
      const updatedHabits = goal.habits.map(h => 
        h.id === habit.id ? {...h, current_value: newValue} : h
      );
      
      // Calculate total progress across all habits
      const totalProgress = updatedHabits.reduce((sum, h) => {
        const habitProgress = h.target_value > 0 ? (h.current_value / h.target_value) : 0;
        return sum + habitProgress;
      }, 0);
      
      const habitCount = updatedHabits.length;
      const progressPercentage = habitCount > 0 ? Math.round((totalProgress / habitCount) * 100) : 0;
      
      // Update goal progress
      const { error: goalError } = await supabase
        .from('goals')
        .update({ 
          progress: progressPercentage,
          current_value: goal.goal_value ? (progressPercentage / 100) * goal.goal_value : 0
        })
        .eq('id', goal.id);
        
      if (goalError) {
        throw new Error(goalError.message);
      }
      
      // Update local state
      setGoal({
        ...goal,
        progress: progressPercentage,
        habits: updatedHabits
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
        .from('goals')
        .update({
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
          icon: editForm.icon,
          deadline: editForm.deadline,
          goal_value: editForm.goal_value,
          goal_unit: editForm.goal_unit
        })
        .eq('id', goal.id);

      if (error) throw error;

      // Update local state
      setGoal({ ...goal, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
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
        {goal && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <Link href="/goals" className="text-[#3c6d71] hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Goals
              </Link>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-[#3c6d71] hover:bg-[#3c6d71]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {isEditing ? 'Cancel Edit' : 'Edit Goal'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {!isEditing ? (
                <>
                  <div className="bg-gradient-to-r from-[#3c6d71]/10 to-[#3c6d71]/5 p-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="text-5xl mr-6">{goal.icon}</div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-800">{goal.name}</h1>
                          <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-[#3c6d71]/10 text-[#3c6d71]">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <div className="text-sm text-gray-500">Deadline</div>
                          <div className="font-medium">{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Target</div>
                          <div className="font-medium text-[#3c6d71]">
                            {goal.goal_value} {goal.goal_unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">Progress</h2>
                      <div className="text-lg font-bold text-[#3c6d71]">
                        {goal.current_value || 0} / {goal.goal_value || 0} {goal.goal_unit} ({goal.progress || 0}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-[#3c6d71] h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${goal.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-8 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Why do you want to acheive this goal?</h2>
                    <p className="text-gray-600 whitespace-pre-line">{goal.description || 'No why provided.'}</p>
                  </div>

                  {goal && goal.habits && goal.habits.length > 0 && (
                    <div className="p-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6">Habits</h2>
                      <div className="space-y-4">
                        {goal.habits.map((habit) => (
                          <div 
                            key={habit.id} 
                            className="p-4 rounded-lg bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{habit.name}</div>
                                {habit.description && (
                                  <div className="text-sm text-gray-500 mt-1">{habit.description}</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-500">
                              {habit.frequency && (
                                <div>Frequency: {habit.frequency}</div>
                              )}
                              {habit.days && habit.days.length > 0 && (
                                <div>Days: {habit.days.join(', ')}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Goal</h2>
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Goal Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Why do you want to acheive this goal?
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                          rows="4"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                        >
                          <option value="Health">Health</option>
                          <option value="Career">Career</option>
                          <option value="Finance">Finance</option>
                          <option value="Personal">Personal</option>
                          <option value="Learning">Learning</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={editForm.deadline}
                          onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={editForm.goal_value}
                          onChange={(e) => setEditForm({ ...editForm, goal_value: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                          min="0"
                          step="any"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Unit
                        </label>
                        <input
                          type="text"
                          value={editForm.goal_unit}
                          onChange={(e) => setEditForm({ ...editForm, goal_unit: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
                          placeholder="e.g., days, kg, hours"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon
                        </label>
                        <input
                          type="text"
                          value={editForm.icon}
                          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none"
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