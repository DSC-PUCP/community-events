import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampusPulse - Discover Campus Events',
  description: 'Find the best student-led events and activities on campus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-slate-900 text-slate-100 py-6">
            <div className=" max-w-7xl mx-auto px-4 text-center text-xs ">
              Hecho con 💖 por{' '}
              <Link
                className={'text-emerald-400'}
                href={'https://dsc.inf.pucp.edu.pe/'}
              >
                DSC PUCP
              </Link>
              .
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
