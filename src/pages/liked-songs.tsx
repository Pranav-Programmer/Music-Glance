// src/pages/liked-songs.tsx (No change needed, but for completeness)
'use client';

import Layout from '@/components/Layout';
import { useAudio } from '../context/AudioContext';
import Footer from '@/components/Footer';

export default function LikedSongs() {
  const { likedSongs } = useAudio();

  return (
    <Layout>
    <div className="flex min-h-screen flex-col">
    <div className="flex-grow mb-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Liked Audios</h1>
      <ul className="space-y-4">
        {likedSongs.map((item, index) => (
          <li key={index} className="flex items-center space-x-4 bg-white dark:bg-white p-4 rounded-xl">
            <img src={`/Au${Math.floor(Math.random() * 25) + 1}.png`} alt="" className="w-12 h-12 rounded-full" />
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <p className="font-semibold truncate">{item.title}</p>
            </div>
            <div className='flex items-center space-x-4 md:space-x-6 flex-wrap gap-y-2'>
            <button onClick={() => window.open(item.sourceUrl, '_blank')} className="text-indigo-500" title="Play on YouTube">▶️ Play</button>
            </div>
          </li>
        ))}
        {likedSongs.length === 0 && <p className="text-gray-400">No liked audios yet.</p>}
      </ul>
    </div>
    <Footer/>
    </div>
    </Layout>
  );
}