'use client';

import { Nunito } from "next/font/google";
import Image from "next/image";
import "./(frontend)/globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: 'swap',
});

// Global 404 for routes without a locale or when middleware is bypassed
export default function NotFound() {
  return (
    <html lang="en" className={nunito.className}>
      <body className="bg-white">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="relative mb-8">
            <h1 className="text-[12rem] font-black text-gray-50 select-none leading-none">404</h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-32 h-32 mb-4 relative">
                 <Image 
                   src="/branding/logo.svg" 
                   alt="MusclePals" 
                   fill 
                   className="object-contain opacity-20"
                 />
              </div>
              <p className="text-2xl font-bold text-gray-900 px-4">
                Page not found
              </p>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-10">
            Oops! It seems you've wandered off the training track.
          </p>

          <a 
            href="/"
            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
