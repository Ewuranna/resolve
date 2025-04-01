import Image from "next/image";
import ImageWithFallback from './components/ImageWithFallback';
import Navbar from "./components/Navbar";
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'


export default async function Home() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

  return (
  
    <div className="min-h-screen bg-white font-['Quicksand']">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section with Gradient Overlay */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3c6d71]/90 to-[#3c6d71]/80 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 z-0"></div>
        <div className="container mx-auto px-6 py-20 md:py-32 relative z-10 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Build habits that <span className="text-[#beef62]">stick</span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg">
                Remember why you started when motivation fades. Connect your daily actions to your bigger purpose.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <a
                  href="/signup"
                  className="px-8 py-4 bg-[#beef62] text-[#3c6d71] rounded-full font-bold hover-lift custom-shadow transition-all duration-300 text-center"
                >
                  Start Now — It's Free
                </a>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-all duration-300 text-center"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="relative h-[500px] w-full">
                <div className="absolute -right-4 -bottom-4 w-full h-full bg-[#beef62]/30 rounded-2xl"></div>
                <div className="absolute inset-0 glass-effect rounded-2xl overflow-hidden border border-white/20">
                  <ImageWithFallback
                    src="/image.jpg"
                    fallbackSrc="/placeholder.png"
                    alt="Habit Tracker App Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500 text-sm">
            <p className="font-medium">Trusted by people from:</p>
            <span>Google</span>
            <span>Microsoft</span>
            <span>Apple</span>
            <span>Amazon</span>
            <span>Meta</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        {/* How It Works Section */}
        <section className="mb-24" id="how-it-works">
          <div className="text-center mb-16">
            <span className="text-[#3c6d71] font-bold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800 gradient-text">
              Three Steps to Better Habits
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Connect Habits to Goals",
                description: "Link each habit to a meaningful goal so you always remember why you're doing it.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                number: "02",
                title: "Get Timely Reminders",
                description: "Receive motivation exactly when you need it most — when you're about to skip.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )
              },
              {
                number: "03",
                title: "Track Your Progress",
                description: "Watch your consistency build over time with beautiful, motivating visualizations.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover-lift custom-shadow">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-[#3c6d71] rounded-full flex items-center justify-center text-white mr-4">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-bold text-[#beef62]">{item.number}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <span className="text-[#3c6d71] font-bold text-sm uppercase tracking-wider">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">
              People <span className="text-[#3c6d71]">Just Like You</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover-lift custom-shadow border-l-4 border-[#beef62]">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-full bg-[#3c6d71]/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#3c6d71]">S</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Sarah J.</h4>
                  <p className="text-sm text-gray-500">Marathon Runner</p>
                </div>
                <div className="ml-auto text-[#beef62]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700">"When I'm about to skip my morning run, seeing my goal of completing a marathon reminds me why I started in the first place. This app changed everything."</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover-lift custom-shadow border-l-4 border-[#beef62]">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-full bg-[#3c6d71]/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#3c6d71]">M</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Michael T.</h4>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
                <div className="ml-auto text-[#beef62]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700">"I've tried many habit trackers, but this is the first one that actually helps me stay motivated by connecting my daily actions to my long-term career goals."</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-8 bg-gradient-to-br from-[#3c6d71] to-[#2a4c4f] rounded-2xl text-white text-center" id="get-started">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Building Better Habits Today
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands who have transformed their habits by staying connected to their "why".
            </p>
            <a
              href="/signup"
              className="px-10 py-5 bg-[#beef62] text-[#3c6d71] rounded-full font-bold hover-lift transition-all duration-300 inline-block text-lg shadow-xl"
            >
              Create Your Free Account
            </a>
            <p className="mt-6 text-white/70 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required. Free forever.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-[#3c6d71]">Resolve</h3>
              <p className="text-gray-600">Habits with purpose</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <a href="/about" className="text-gray-600 hover:text-[#3c6d71] transition-colors">About</a>
              <a href="/privacy" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Privacy</a>
              <a href="/terms" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Terms</a>
              <a href="/contact" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Resolve.
          </div>
        </div>
      </footer>
    </div>
  );
}
