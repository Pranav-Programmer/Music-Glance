'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Playlist from '../components/Playlist';
import Layout from '../components/Layout';
import Footer from '@/components/Footer';
import TicTacToe from '../components/TicTacToe';

export default function Hero() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [toast, setToast] = useState<string | null>(null); // Toast message
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load theme, playlist, and liked songs
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }

    const savedLiked = localStorage.getItem('likedSongs');
    if (savedLiked) {
      setLikedSongs(JSON.parse(savedLiked));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const savePlaylist = (newPlaylist: Track[]) => {
    setPlaylist(newPlaylist);
    localStorage.setItem('playlist', JSON.stringify(newPlaylist));
  };

  const saveLikedSongs = (newLiked: Track[]) => {
    setLikedSongs(newLiked);
    localStorage.setItem('likedSongs', JSON.stringify(newLiked));
  };

  const toggleLike = (index: number) => {
    const newPlaylist = [...playlist];
    const track = newPlaylist[index];
    track.liked = !track.liked;
    savePlaylist(newPlaylist);

    if (track.liked) {
      if (!likedSongs.some(l => l.title === track.title)) {
        saveLikedSongs([...likedSongs, track]);
      }
    } else {
      saveLikedSongs(likedSongs.filter(l => l.title !== track.title));
    }
  };

  const deleteTrack = (index: number) => {
    const trackToDelete = playlist[index];
    const newPlaylist = playlist.filter((_, i) => i !== index);
    savePlaylist(newPlaylist);

    // Remove from liked if present
    saveLikedSongs(likedSongs.filter(l => l.title !== trackToDelete.title));
  };

  const fetchTitles = async (urlList: string[]) => {
    const tracks: Track[] = [];
    for (const url of urlList) {
      let title = 'Unknown Track';
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          title = data.title || title;
        }
      } catch (e) {
        console.error('Failed to fetch title for', url, e);
      }
      tracks.push({
        title,
        liked: false,
        sourceUrl: url,
      });
    }
    return tracks;
  };

  const handleDownload = async () => {
  setError('');
  setLoading(true);

  const urlList = urls
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean);

  if (urlList.length === 0) {
    setError('Please paste at least one valid URL');
    setLoading(false);
    return;
  }

  try {
    // Fetch real titles
    const newTracks = await fetchTitles(urlList);

    // Filter out any tracks that already exist by sourceUrl
    const existingUrls = new Set(playlist.map(t => t.sourceUrl));
    const uniqueNewTracks = newTracks.filter(track => !existingUrls.has(track.sourceUrl));

    // Only add unique tracks
    if (uniqueNewTracks.length > 0) {
      const updatedPlaylist = [...uniqueNewTracks, ...playlist];
      savePlaylist(updatedPlaylist);
    } else {
      console.log('All URLs already exist — skipping duplicate add');
      setToast(`Audio already exists in the playlist!`);
    }

    // Proceed with actual download (file will still be saved again)
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlList, type: 'audio' }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Download failed');
    }

    const blob = await response.blob();
    let filename = urlList.length > 1 ? 'downloads.zip' : `${newTracks[0]?.title || 'audio'}.mp3`;

    const disposition = response.headers.get('Content-Disposition');
    if (disposition) {
      let match = disposition.match(/filename\*?=UTF-8''([^;]*)/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]).replace(/_+$/, '').trim();
      } else {
        match = disposition.match(/filename="?([^"]*)"?/i);
        if (match && match[1]) {
          filename = match[1].replace(/_+$/, '').trim();
        }
      }
    }

    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (err: any) {
    setError(err.message || 'Something went wrong');
    console.error(err);
  } finally {
    setLoading(false);
    window.location.reload();
  }
};

  // Inside your home component
useEffect(() => {
  const savedUrls = localStorage.getItem('downloadUrls');
  if (savedUrls) {
    setUrls(savedUrls);
    localStorage.removeItem('downloadUrls'); // Clear after loading (optional)
  }
}, []);

  return (
    <div>
  <Layout>
    <div className="flex min-h-screen flex-col">
    <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          <div className={`rounded-2xl p-4 md:p-6 mb-8 shadow-xl ${theme === 'dark' ? 'bg-indigo-900 bg-opacity-70' : 'bg-white bg-opacity-70'}`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Download Your Music</h2>
            <div className={`relative w-full mb-4 md:mb-6 ${theme === 'dark' ? 'bg-indigo-900' : 'bg-white'} rounded-2xl px-4 py-4 shadow-md`}>
              <textarea
                placeholder="Paste music URLs here (one per line)..."
                className="w-full h-32 bg-transparent outline-none placeholder-gray-500 resize-none text-sm md:text-base"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                disabled={loading || !urls.trim()}
                className={`py-2 md:py-3 px-4 md:px-6 text-base md:text-lg font-semibold rounded-full transition-all flex items-center justify-center ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : `${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white shadow-lg hover:shadow-xl`
                }`}
                title="Download"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  'Download Audio'
                )}
              </button>
            {error && <p className="mt-4 text-red-500 text-center text-sm md:text-base">{error}</p>}
          </div>
          {loading && (
                <p className="mt-4 text-center text-indigo-600 font-medium">
                 ⏳ Download is running in the background — please keep this page open until it finishes. ⏳
                </p>
              )}
            </div>

          {loading && (<TicTacToe />)}

          <Playlist playlist={playlist} onToggleLike={toggleLike} onDelete={deleteTrack} />
        </main>
        <Footer/>
        </div>
        {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in-out z-50">
          {toast}
        </div>
      )}

      {/* Toast animation */}
      <style jsx global>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 5s ease-in-out forwards;
        }
      `}</style>
    </Layout>
    </div>
  );
}

export { Hero };