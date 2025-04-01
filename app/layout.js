import { Quicksand } from 'next/font/google';
import './globals.css';

// Initialize the Quicksand font with proper subsets
const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
});

export const metadata = {
  title: 'Resolve - Build habits that stick',
  description: 'Connect your daily actions to your bigger purpose',
  icons: {
    icon: '/Resolve icon.png',
    apple: '/Resolve icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
