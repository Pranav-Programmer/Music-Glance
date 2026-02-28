'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Track {
  title: string;
  liked: boolean;
  sourceUrl: string;
}

interface AudioContextType {
  playlist: Track[];
  likedSongs: Track[];
  playlists: Record<string, Track[]>;
  addToPlaylist: (newTracks: Track[]) => void;
  toggleLike: (title: string) => void;
  deleteTrack: (title: string) => void;
  createPlaylist: (name: string) => void;
  addToCustomPlaylist: (playlistName: string, track: Track) => void;
  setPlaylistTracks: (playlistName: string, tracks: Track[]) => void;
  setPlaylists: (playlists: Record<string, Track[]>) => void; // Add this to the interface
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [playlists, setPlaylistsState] = useState<Record<string, Track[]>>({});

  useEffect(() => {
    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));

    const savedLiked = localStorage.getItem('likedSongs');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));

    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) setPlaylistsState(JSON.parse(savedPlaylists));
  }, []);

  const savePlaylist = (newPlaylist: Track[]) => {
    setPlaylist(newPlaylist);
    localStorage.setItem('playlist', JSON.stringify(newPlaylist));
  };

  const saveLikedSongs = (newLiked: Track[]) => {
    setLikedSongs(newLiked);
    localStorage.setItem('likedSongs', JSON.stringify(newLiked));
  };

  const setPlaylists = (newPlaylists: Record<string, Track[]>) => { // Renamed to setPlaylists, saves to localStorage
    setPlaylistsState(newPlaylists);
    localStorage.setItem('playlists', JSON.stringify(newPlaylists));
  };

  const addToPlaylist = (newTracks: Track[]) => {
    const existingUrls = new Set(playlist.map(t => t.sourceUrl));
    const uniqueNewTracks = newTracks.filter(track => !existingUrls.has(track.sourceUrl));
    if (uniqueNewTracks.length === 0) return;
    const updated = [...uniqueNewTracks, ...playlist];
    savePlaylist(updated);
  };

  const toggleLike = (title: string) => {
    const newPlaylist = playlist.map(track =>
      track.title === title ? { ...track, liked: !track.liked } : track
    );
    savePlaylist(newPlaylist);

    const track = playlist.find(t => t.title === title);
    if (track && !track.liked) {
      if (!likedSongs.some(l => l.title === title)) {
        saveLikedSongs([...likedSongs, track]);
      }
    } else if (track) {
      saveLikedSongs(likedSongs.filter(l => l.title !== title));
    }
  };

  const deleteTrack = (title: string) => {
    const newPlaylist = playlist.filter(t => t.title !== title);
    savePlaylist(newPlaylist);
    saveLikedSongs(likedSongs.filter(l => l.title !== title));
  };

  const createPlaylist = (name: string) => {
    if (!playlists[name]) {
      setPlaylists({ ...playlists, [name]: [] });
    }
  };

  const addToCustomPlaylist = (playlistName: string, track: Track) => {
    if (playlists[playlistName]) {
      setPlaylists({
        ...playlists,
        [playlistName]: [...playlists[playlistName], track],
      });
    }
  };

  const setPlaylistTracks = (playlistName: string, newTracks: Track[]) => {
    if (playlists[playlistName] !== undefined) {
      setPlaylists({
        ...playlists,
        [playlistName]: newTracks,
      });
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playlist,
        likedSongs,
        playlists,
        addToPlaylist,
        toggleLike,
        deleteTrack,
        createPlaylist,
        addToCustomPlaylist,
        setPlaylistTracks,
        setPlaylists, // Now exposed
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};