// src/components/Playlist.tsx (New file)
import Link from 'next/link';

interface Track {
  title: string;
  liked: boolean;
  sourceUrl: string;
}

function Playlist({ playlist, onToggleLike, onDelete }: {
  playlist: Track[];
  onToggleLike: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  const playTrack = (sourceUrl: string) => {
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  // Show only latest 5, with latest on top
  const displayedPlaylist = playlist.slice(0, 5);

  return (
    <div className={`rounded-2xl p-6 shadow-xl ${displayedPlaylist.length > 0 ? 'bg-indigo-900 bg-opacity-70 dark:bg-white bg-opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Downloads</h2>
        <Link href="/discover">
        <span className="text-sm text-indigo-500 cursor-pointer">View All</span>
        </Link>
      </div>
      <ul className="space-y-4">
        {displayedPlaylist.map((item, index) => (
          <li key={index} className="flex items-center space-x-4">
            <img
              src={`/Au${Math.floor(Math.random() * 25) + 1}.png`}
              alt="Audio Logo"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.title}</p>
              <p className="text-sm text-gray-400 truncate">Downloaded Track</p>
            </div>
            {/* <span className="text-sm text-gray-400 flex-shrink-0">N/A</span> */}
            <button onClick={() => playTrack(item.sourceUrl)} className="text-indigo-500 hover:text-indigo-700 flex-shrink-0" title="Play on YouTube">▶️</button>
            <button
              onClick={() => onToggleLike(index)}
              className={`text-xl ${item.liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors flex-shrink-0`}
              title={item.liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            >
              {item.liked ? '❤️' : '🤍' }
            </button>
            <button onClick={() => onDelete(index)} className="text-red-500 hover:text-red-700 flex-shrink-0" title="Delete">🗑️</button>
          </li>
        ))}
        {displayedPlaylist.length === 0 && <p className="text-gray-400">No tracks downloaded yet.</p>}
      </ul>
    </div>
  );
}

export default Playlist;