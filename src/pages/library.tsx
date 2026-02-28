// src/pages/library.tsx (Updated with toast notification)
'use client';

import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';

export default function Library() {
  const { playlist, playlists, createPlaylist, addToCustomPlaylist, toggleLike, deleteTrack } = useAudio();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [toast, setToast] = useState<string | null>(null); // Toast message

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setToast(`Playlist "${newPlaylistName}" created!`);
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Get all songs that are in at least one custom playlist
  const songsInPlaylists = new Set(
    Object.values(playlists).flatMap(tracks => tracks.map(track => track.title))
  );

  // Filter out songs that are in any custom playlist
  const availableSongs = playlist.filter(track => !songsInPlaylists.has(track.title));

  const handleAddToPlaylist = (playlistName: string, track: any) => {
    addToCustomPlaylist(playlistName, track);
    setToast(`Added to "${playlistName}"!`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow mb-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create New Playlist</h2>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Playlist name"
                className="flex-1 p-3 border rounded-lg"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <button
                onClick={handleCreatePlaylist}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Downloaded Audios</h2>
            {availableSongs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-600 text-center">
                No audio available or all downloaded audios are in playlists.
              </p>
            ) : (
              <ul className="space-y-6">
                {availableSongs.map((track, i) => (
                  <li
                    key={i}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    {/* Image + Title */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <img
                        src={`/Au${Math.floor(Math.random() * 25) + 1}.png`}
                        alt="Audio cover"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <p className="font-semibold truncate">{track.title}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 md:space-x-6 flex-wrap gap-y-2">
                      <button
                        onClick={() => toggleLike(track.title)}
                        className={`text-xl transition-colors ${
                          track.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`}
                        title="Add to Liked Songs"
                      >
                        {track.liked ? '❤️' : '🤍'}
                      </button>

                      <button
                        onClick={() => deleteTrack(track.title)}
                        className="text-red-500 hover:text-red-700 text-xl transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>

                      <select
                        value="" // Always show "Add to Playlist"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddToPlaylist(e.target.value, track);
                            e.target.value = ""; // Reset dropdown
                          }
                        }}
                        className="border max-w-32 border-gray-300 dark:border-gray-600 rounded px-2.5 py-1.5 text-sm bg-white dark:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Add to Playlist</option>
                        {Object.keys(playlists).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Footer />
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
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>
    </Layout>
  );
}