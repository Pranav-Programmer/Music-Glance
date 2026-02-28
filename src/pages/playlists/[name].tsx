// src/pages/playlists/[name].tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import Layout from '../../components/Layout';
import Footer from '@/components/Footer';

export default function PlaylistPage() {
  const router = useRouter();
  const { name } = router.query;
  const { playlists, toggleLike, setPlaylists, setPlaylistTracks} = useAudio();

  const currentName = name as string;
  const tracks = playlists[currentName] || [];

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== currentName) {
      const updatedPlaylists = { ...playlists };
      updatedPlaylists[newName.trim()] = updatedPlaylists[currentName];
      delete updatedPlaylists[currentName];

      // Save to localStorage via context setter
      setPlaylists(updatedPlaylists);

      // Redirect to new playlist URL
      router.replace(`/playlists/${encodeURIComponent(newName.trim())}`);
    }
    setIsEditing(false);
  };

  const handleDeletePlaylist = () => {
    if (confirm(`Are you sure you want to delete playlist "${currentName}"?`)) {
      const updatedPlaylists = { ...playlists };
      delete updatedPlaylists[currentName];

      // Save to localStorage via context setter
      setPlaylists(updatedPlaylists);

      // Redirect to Library
      router.push('/library');
    }
  };

  const removeFromPlaylist = (trackToRemove: Track) => {
    const updatedTracks = tracks.filter(t => t.title !== trackToRemove.title);
    setPlaylistTracks(currentName, updatedTracks);
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow p-4 md:p-8">
          {/* Playlist Header with Edit & Delete */}
          <div className="flex items-center justify-between mb-6">
            {isEditing ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 p-2 border rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button onClick={handleRename} className="text-green-500 hover:text-green-700">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <h1 className="text-3xl font-bold">{currentName}</h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-indigo-500 hover:text-indigo-700 text-xl"
                    title="Edit playlist name"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="text-red-500 hover:text-red-700 text-xl"
                    title="Delete playlist"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>

          <ul className="space-y-4">
            {tracks.map((item, index) => (
              <li
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                {/* Image + Title */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <img
                    src={`/Au${Math.floor(Math.random() * 25) + 1}.png`}
                    alt="Audio cover"
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <p className="font-semibold truncate">{item.title}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 md:space-x-6 flex-wrap gap-y-2">
                  {/* Play */}
                  <button
                    onClick={() => window.open(item.sourceUrl, '_blank')}
                    className="text-indigo-500 hover:text-indigo-700 text-xl transition-colors"
                    title="Play on YouTube"
                  >
                    ▶️
                  </button>

                  {/* Remove from Playlist */}
                  <button
                    onClick={() => removeFromPlaylist(item)}
                    className="text-red-500 hover:text-red-700 text-xl transition-colors relative group"
                    title="Remove from playlist"
                  >
                    <span className="relative inline-block w-6 h-6">
                      <span className="absolute mt-1 -mb-1 inset-0 rounded-full border-2 border-red-500"></span>
                      <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">━</span>
                    </span>
                  </button>

                   {/* Like */}
                  {/* <button
                    onClick={() => toggleLike(item.title)}
                    className={`text-xl transition-colors ${
                      item.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                    title={item.liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                  >
                    {item.liked ? '❤️' : '🤍'}
                  </button> */}

                </div>
              </li>
            ))}
            {tracks.length === 0 && (
              <p className="text-gray-400 text-center mt-6">No tracks in this playlist yet.</p>
            )}
          </ul>
        </div>

        <Footer />
      </div>
    </Layout>
  );
}