import Image from "next/image";
import ImageWithFallback from './components/ImageWithFallback';
import Navbar from "./components/Navbar";
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link';
export default async function Home() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

  return (
    <div className="min-h-screen bg-white font-quicksand">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section with Gradient Overlay */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3c6d71]/90 to-[#3c6d71]/80 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 relative z-10 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Build habits that <span className="text-[#beef62]">stick</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-lg mx-auto md:mx-0">
                Remember why you started when motivation fades. Connect your daily actions to your bigger purpose.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link
                  href="/signup"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-[#beef62] text-[#3c6d71] rounded-full font-bold hover-lift custom-shadow transition-all duration-300 text-center"
                >
                  Start Now — It's Free
                </Link>
                <a
                  href="#how-it-works"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-all duration-300 text-center"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 w-full px-4">
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
                <div className="absolute -right-4 -bottom-4 w-full h-full bg-[#beef62]/30 rounded-2xl"></div>
                <div className="absolute inset-0 glass-effect rounded-2xl overflow-hidden border border-white/20">
                  <ImageWithFallback
                    src="/image.jpg"
                    fallbackSrc="/placeholder.png"
                    alt="Habit Tracker App Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
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
      <div className="bg-gray-50 py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-16 text-gray-500 text-xs sm:text-sm">
            <p className="font-medium w-full text-center sm:w-auto">Trusted by people from:</p>
            <span>Google</span>
            <span>Microsoft</span>
            <span>Apple</span>
            <span className="hidden sm:inline">Amazon</span>
            <span className="hidden sm:inline">Meta</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-6xl">
        {/* How It Works Section */}
        <section className="mb-16 md:mb-24" id="how-it-works">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            How <span className="text-[#3c6d71]">Resolve</span> Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover-lift custom-shadow border-t-4 border-[#3c6d71]">
              <div className="h-12 w-12 rounded-full bg-[#3c6d71]/10 flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-[#3c6d71]">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Define Your Purpose</h3>
              <p className="text-gray-600">
                Start by setting meaningful goals that connect to your deeper values and aspirations.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover-lift custom-shadow border-t-4 border-[#3c6d71]">
              <div className="h-12 w-12 rounded-full bg-[#3c6d71]/10 flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-[#3c6d71]">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Build Daily Habits</h3>
              <p className="text-gray-600">
                Create small, consistent habits that move you toward your goals, one day at a time.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover-lift custom-shadow border-t-4 border-[#3c6d71]">
              <div className="h-12 w-12 rounded-full bg-[#3c6d71]/10 flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-[#3c6d71]">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Stay Motivated</h3>
              <p className="text-gray-600">
                See how your daily actions connect to your bigger goals, keeping you motivated when it gets tough.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover-lift custom-shadow border-l-4 border-[#beef62]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <div className="flex-shrink-0 mb-4 sm:mb-0">
                  <div className="h-14 w-14 rounded-full bg-[#3c6d71]/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#3c6d71]">S</span>
                  </div>
                </div>
                <div className="sm:ml-4">
                  <h4 className="font-bold text-gray-800">Sarah K.</h4>
                  <p className="text-sm text-gray-500">Marathon Runner</p>
                </div>
                <div className="sm:ml-auto text-[#beef62] mt-4 sm:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700">"When I'm about to skip my morning run, seeing my goal of completing a marathon reminds me why I started in the first place. This app changed everything."</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover-lift custom-shadow border-l-4 border-[#beef62]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <div className="flex-shrink-0 mb-4 sm:mb-0">
                  <div className="h-14 w-14 rounded-full bg-[#3c6d71]/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#3c6d71]">M</span>
                  </div>
                </div>
                <div className="sm:ml-4">
                  <h4 className="font-bold text-gray-800">Michael T.</h4>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
                <div className="sm:ml-auto text-[#beef62] mt-4 sm:mt-0">
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
        <section className="py-12 sm:py-16 px-4 sm:px-8 bg-gradient-to-br from-[#3c6d71] to-[#2a4c4f] rounded-2xl text-white text-center" id="get-started">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Start Building Better Habits Today
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands who have transformed their habits by staying connected to their "why".
            </p>
            <Link
              href="/signup"
              className="px-8 sm:px-10 py-4 sm:py-5 bg-[#beef62] text-[#3c6d71] rounded-full font-bold hover-lift transition-all duration-300 inline-block text-base sm:text-lg shadow-xl"
            >
              Create Your Free Account
            </Link>
            <p className="mt-4 sm:mt-6 text-white/70 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required. Free forever.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#3c6d71]">Resolve</h3>
              <p className="text-gray-600">Habits with purpose</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link href="/about" className="text-gray-600 hover:text-[#3c6d71] transition-colors">About</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-[#3c6d71] transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Resolve.
          </div>
        </div>
      </footer>
    </div>
  );
}
