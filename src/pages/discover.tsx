// src/pages/discover.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext'; // Adjust path
import Layout from '../components/Layout';
import Footer from '@/components/Footer';

export default function Discover() {
  const { playlist } = useAudio();
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string[]>([]);
  const [renderKey, setRenderKey] = useState(0); // Force re-render when playlist changes

  // Watch playlist length to force update (simple & effective)
  useEffect(() => {
    setRenderKey(prev => prev + 1); // Increment key → forces grid re-render
  }, [playlist.length]); // Only when length changes (new song added)

  // Optional: Log for debugging
  useEffect(() => {
    console.log('Discover: Playlist updated, length =', playlist.length);
  }, [playlist]);

  const filteredAudios = playlist.filter(audio =>
    audio.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (url: string, title: string) => {
    setDownloading(prev => [...prev, url]);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [url], type: 'audio' }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error downloading audio:', err);
      alert('Failed to download audio');
    } finally {
      setDownloading(prev => prev.filter(u => u !== url));
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow pt-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <input
            type="text"
            placeholder="Search music from title..."
            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div key={renderKey} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredAudios.map((audio, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <img src={`/Au${Math.floor(Math.random() * 25) + 1}.png`} alt="" className="w-40 h-40 object-cover rounded-lg mb-3"/>
                <p className="font-semibold truncate">{audio.title}</p>
                <div className="flex sm:flex-row sm:items-center sm:justify-between gap-6">
                  <button onClick={() => window.open(audio.sourceUrl, '_blank')} className="text-indigo-500 mt-2 text-sm block" title="Play on YouTube">
                    ▶️ Play
                  </button>
                  <button 
                    onClick={() => handleDownload(audio.sourceUrl, audio.title)}
                    disabled={downloading.includes(audio.sourceUrl)}
                    className={`text-green-500 mt-1 text-sm block hover:text-green-700 flex items-center justify-start ${
                      downloading.includes(audio.sourceUrl) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    title="Download"
                  >
                    {downloading.includes(audio.sourceUrl) ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      '⬇️ Download'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredAudios.length === 0 && <p className="text-gray-400 text-center mt-6">No audios found.</p>}
        </div>
        <Footer />
      </div>
    </Layout>
  );
}