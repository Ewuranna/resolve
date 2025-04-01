'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar({ isAuthenticated = false, user = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center relative z-10">
              <Image 
                src="/resolve logo.png" 
                alt="Resolve Logo" 
                width={120} 
                height={40} 
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Navigation for authenticated users */}
            {isAuthenticated && (
              <div className="hidden md:flex ml-10 space-x-8">
                <Link href="/dashboard" className="text-gray-700 hover:text-[#3c6d71] font-medium">
                  Dashboard
                </Link>
                <Link href="/goals" className="text-gray-700 hover:text-[#3c6d71] font-medium">
                  Goals
                </Link>
                <Link href="/routine" className="text-gray-700 hover:text-[#3c6d71] font-medium">
                  Routine
                </Link>
                <Link href="/rewards" className="text-gray-700 hover:text-[#3c6d71] font-medium">
                  Rewards
                </Link>
                <Link href="/streaks" className="text-gray-700 hover:text-[#3c6d71] font-medium">
                  Streaks
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                {/* Points display */}
                <div className="hidden md:flex items-center mr-6 bg-[#3c6d71]/10 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3c6d71] mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="text-sm font-medium text-[#3c6d71]">750 points</span>
                </div>
                
                {/* User profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="h-8 w-8 bg-[#3c6d71] rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('userProfile');
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 relative z-10">
                <Link href="/signin" className="text-gray-700 hover:text-[#3c6d71] font-medium px-3 py-2">
                  Sign in
                </Link>
                <Link href="/signup" className="bg-[#3c6d71] text-white px-4 py-2 rounded-lg hover:bg-[#3c6d71]/90 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden ml-4 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden mt-4 pb-3 border-t border-gray-100">
            <div className="pt-2 space-y-1">
              <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Dashboard
              </Link>
              <Link href="/goals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Goals
              </Link>
              <Link href="/routine" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Routine
              </Link>
              <Link href="/rewards" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Rewards
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Profile
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('userProfile');
                  window.location.href = '/';
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
        {isMenuOpen && !isAuthenticated && (
          <div className="md:hidden mt-4 pb-3 border-t border-gray-100 relative z-10">
            <div className="pt-2 space-y-1">
              <Link href="/signin" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Sign in
              </Link>
              <Link href="/signup" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )}