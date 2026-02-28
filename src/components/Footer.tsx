// src/components/Footer.tsx
'use client';

import { useState, useRef } from 'react';
import Fireflies from './Fireflies'; // Adjust path

export default function Footer() {
  const [showTear, setShowTear] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerTear = () => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
    }

    // Show tear animation
    setShowTear(true);

    // Reset after animation completes
    setTimeout(() => setShowTear(false), 1500);
  };

  return (
    <footer className="relative bg-gradient-to-b from-cyan-600 to-white-700 text-white -mr-8 -ml-8 overflow-hidden">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/sounds/mixkithappybells.wav" preload="auto" />

      {/* Wavy top border */}
     <div
  className="absolute -mt-4 md:-mt-12 top-10 md:top-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-200 overflow-hidden"
  style={{ clipPath: 'ellipse(150% 100% at 115% 163%)' }}
>
  <Fireflies count={3000} color={0xffee99} size={0.4} speed={1.3} spread={30}/>
  <Fireflies count={3000} color={0xffee99} size={0.4} speed={1.3} spread={70}/>
</div>
      <div
        className="absolute mt-20 md:mt-28 top-10 md:top-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-200 transform scale-y-[-1]"
        style={{ clipPath: 'ellipse(150% 100% at 115% 163%)' }}
      >
        <Fireflies count={3000} color={0xffee99} size={0.4} speed={1.3} spread={30}/>
        <Fireflies count={3000} color={0xffee99} size={0.4} speed={1.3} spread={70}/>
      </div>

      {/* Golden tearing effect */}
      {showTear && (
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 opacity-0 animate-tear z-10"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFAA00 50%, #FFD700 100%)',
            mixBlendMode: 'overlay',
          }}
        />
      )}

      <div className="relative container mx-auto px-6 py-6 md:py-2 text-center">
        {/* Logo + mascot + fancy "Click me" */}
        <div className="flex flex-col items-center gap-4 mt-16">
          <div className="flex items-center gap-4 md:gap-6 relative group">
            <div className="text-2xl -ml-10 md:text-7xl font-black tracking-tight">MusicGlance</div>

            {/* Fancy "Click me" text */}
            <div className="absolute top-4 md:-top-10 -right-44 md:left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:-top-0 whitespace-nowrap pointer-events-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 font-bold text-lg md:text-2xl tracking-wider drop-shadow-lg group-hover:animate-pulse-slow">
                Click me ✨
              </span>
            </div>

            <button
              onClick={triggerTear}
              className="w-16 h-16 md:w-24 md:h-24 drop-shadow-lg hover:shadow-2xl cursor-pointer bg-gradient-to-b from-cyan-300 to-white-900 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none border-2 border-yellow-400/50 hover:border-yellow-400"
              aria-label="Trigger golden tear effect & sound"
            >
              <span className="text-4xl md:text-6xl drop-shadow-md">🔊</span>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-gray-700 mt-8 text-sm">
          © {new Date().getFullYear()} MusicGlance. All rights reserved. (psd)
        </p>
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes tearReveal {
          0% {
            opacity: 0;
            transform: translateY(-120%) scaleX(0.4);
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
          }
          40% {
            opacity: 0.9;
            transform: translateY(0) scaleX(1.15);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          70% {
            opacity: 0.6;
            transform: translateY(30%) scaleX(0.95);
          }
          100% {
            opacity: 0;
            transform: translateY(80%) scaleX(0.7);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }

        .animate-tear {
          animation: tearReveal 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .group-hover\\:animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }
      `}</style>
    </footer>
  );
}