// src/components/Layout.tsx (If not already created, paste this full code into it)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudio } from '../context/AudioContext'; // Adjust path
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { likedSongs, playlists } = useAudio();
  const [sidebarOpen, setSidebarOpen] = useState(false);

    const [urls, setUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState<'dark' | 'light'>('light');
    const [playlist, setPlaylist] = useState<Track[]>([]);
  
    // Load theme, playlist, and liked songs
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      if (savedTheme) setTheme(savedTheme);
  
      const savedPlaylist = localStorage.getItem('playlist');
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist));
      }
  
    //   const savedLiked = localStorage.getItem('likedSongs');
    //   if (savedLiked) {
    //     setLikedSongs(JSON.parse(savedLiked));
    //   }
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
        // Fetch real titles and add to playlist immediately (prepend for latest on top)
        const newTracks = await fetchTitles(urlList);
        const updatedPlaylist = [...newTracks, ...playlist]; // Prepend new to old
        savePlaylist(updatedPlaylist);
  
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
        let filename = urlList.length > 1 ? 'downloads.zip' : `${newTracks[0].title}.mp3`;
  
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
      }
    };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-100 via-indigo-100 to-purple-100 text-gray-800' : 'bg-gradient-to-br from-cyan-100 via-indigo-100 to-purple-100 text-gray-800'}`}>
      {/* Top Navbar */}
      <header className="flex items-center justify-between py-2 px-4 sticky top-0 z-10 md:hidden bg-gradient-to-br from-cyan-100 via-cyan-100 to-purple-100">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-2xl">
            ☰
          </button>
          {/* <div className="text-2xl font-bold text-indigo-500">MusicGlance</div> */}
          <img
              src={`/MG.png`}
              alt="Audio Logo"
              className="w-40 h-auto object-cover flex-shrink-0"
            />
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-xl">
            {/* {theme === 'dark' ? '☀️' : '🌙'} */}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh)] relative">
        
        {/* Sidebar */}
        <aside className={`absolute top-0 left-0 w-64 h-full p-6 space-y-8 transition-transform duration-300 transform md:relative md:translate-x-0 z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-white bg-opacity-90' : 'bg-white bg-opacity-90'} shadow-lg md:shadow-none border-solid border-gray-300 border-8`}>
           <header className="flex items-center justify-between py-2 sticky top-0 z-10 hidden md:block">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-2xl">
            ☰
          </button>
          {/* <div className="text-2xl font-bold text-indigo-500">MusicGlance</div> */}
          <img
              src={`/MG.png`}
              alt="Audio Logo"
              className="w-full h-auto object-cover flex-shrink-0"
            />
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-xl">
            {/* {theme === 'dark' ? '☀️' : '🌙'} */}
          </button>
          <div className="flex items-center space-x-2">
            {/* <span>Pranav</span> */}
            {/* <div className="w-8 h-8 bg-gray-300 rounded-full"></div> */}
          </div>
        </div>
      </header>
          <div className="space-y-4">
            <ul className="space-y-3">
              <li>
                <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span>🏠</span> <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/discover" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span>🔍</span> <span>Discover</span>
                </Link>
              </li>
              <li>
                <Link href="/library" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span>📚</span> <span>Library</span>
                </Link>
              </li>
              <li>
                <Link href="/liked-songs" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span>❤️</span> <span>Liked Audios ({likedSongs.length})</span>
                </Link>
              </li>
              <li>
                <Link href="/youtube" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span><svg width="22px" height="22px" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M36,72 L36,72 C55.882251,72 72,55.882251 72,36 L72,36 C72,16.117749 55.882251,-3.65231026e-15 36,0 L36,0 C16.117749,3.65231026e-15 -2.4348735e-15,16.117749 0,36 L0,36 C2.4348735e-15,55.882251 16.117749,72 36,72 Z" fill="#FF0002"/><path d="M31.044,42.269916 L31.0425,28.6877416 L44.0115,35.5022437 L31.044,42.269916 Z M59.52,26.3341627 C59.52,26.3341627 59.0505,23.003199 57.612,21.5363665 C55.7865,19.610299 53.7405,19.6012352 52.803,19.4894477 C46.086,19 36.0105,19 36.0105,19 L35.9895,19 C35.9895,19 25.914,19 19.197,19.4894477 C18.258,19.6012352 16.2135,19.610299 14.3865,21.5363665 C12.948,23.003199 12.48,26.3341627 12.48,26.3341627 C12.48,26.3341627 12,30.2467232 12,34.1577731 L12,37.8256098 C12,41.7381703 12.48,45.6492202 12.48,45.6492202 C12.48,45.6492202 12.948,48.9801839 14.3865,50.4470165 C16.2135,52.3730839 18.612,52.3126583 19.68,52.5135736 C23.52,52.8851913 36,53 36,53 C36,53 46.086,52.9848936 52.803,52.4954459 C53.7405,52.3821478 55.7865,52.3730839 57.612,50.4470165 C59.0505,48.9801839 59.52,45.6492202 59.52,45.6492202 C59.52,45.6492202 60,41.7381703 60,37.8256098 L60,34.1577731 C60,30.2467232 59.52,26.3341627 59.52,26.3341627 L59.52,26.3341627 Z" fill="#FFF"/></g></svg></span> <span>YouTube</span>
                </Link>
              </li>
              <li>
                <Link href="/tictactoe" className="flex items-center space-x-3 cursor-pointer hover:text-indigo-400">
                  <span>🎮</span> <span>Play</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm uppercase text-gray-600 bolder font-bold">🎵 My Playlists</h3>
            <ul className="space-y-3 ml-6">
              {Object.keys(playlists).map(name => (
                <li key={name}>
                  <Link href={`/playlists/${encodeURIComponent(name)}`} className="cursor-pointer hover:text-indigo-400">
                    ➤ {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Overlay for mobile sidebar close */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black opacity-50 md:hidden z-10"></div>}

        {/* Main Content */}
        <main className="flex-1 pl-8 pr-8 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  );
}