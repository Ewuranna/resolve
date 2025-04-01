'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../../utils/supabase';

export default function Goals() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // Add filter state

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/signin');
          return;
        }

        if (!session) {
          console.error('No active session');
          router.push('/signin');
          return;
        }

        console.log('Current user ID:', session.user.id);

        const { data, error } = await supabase
          .from('goals')
          .select(`
            *,
            habits (*)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        console.log('Goals data from Supabase:', data); // Changed from goalsData to data
        console.log('Goals error if any:', error); // Changed from goalsError to error

        if (error) { // Changed from goalsError to error
          console.error('Error fetching goals:', error);
          throw new Error(error.message);
        }

        setGoals(data || []);
      } catch (error) {
        console.error('Error in fetchGoals:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [router]);

  // Filter goals based on progress
  const filteredGoals = goals.filter(goal => {
    switch(filter) {
      case 'notStarted':
        return goal.progress === 0;
      case 'inProgress':
        return goal.progress > 0 && goal.progress < 100;
      case 'completed':
        return goal.progress === 100;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand']">
      <Navbar isAuthenticated={true} />
      <div className="pt-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Goals</h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3c6d71] focus:border-[#3c6d71] outline-none text-gray-700"
            >
              <option value="all">All Goals</option>
              <option value="notStarted">Not Started</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <Link 
              href="/goals/new" 
              className="bg-[#3c6d71] text-white px-4 py-2 rounded-lg hover:bg-[#3c6d71]/90 flex items-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Goal
            </Link>
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
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No goals yet' : 'No goals match the selected filter'}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Create your first goal to start tracking your progress' 
                : 'Try selecting a different filter or create a new goal'}
            </p>
            <Link 
              href="/goals/new"
              className="inline-flex items-center text-[#3c6d71] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create a goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Link 
                key={goal.id} 
                href={`/goals/${goal.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{goal.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{goal.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3c6d71]/10 text-[#3c6d71]">
                    {goal.category}
                  </span>
                  <div className="text-sm text-gray-500">
                    {goal.progress}% complete
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}