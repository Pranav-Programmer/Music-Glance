'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  views: string;
  uploaded: string;
  url: string;
}

export default function YouTubePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedUrls, setAddedUrls] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'primary' | 'backup' | 'failed'>('primary');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const primaryKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const backupKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_BKP;

  const fetchVideos = async (url: string, isSearch = false) => {
    const currentKey = apiStatus === 'primary' ? primaryKey : backupKey;

    try {
      const res = await fetch(url.replace('API_KEY_PLACEHOLDER', currentKey));
      const data = await res.json();

      if (!res.ok) {
        // Quota exceeded or rate limit → switch to backup
        if (res.status === 403 || res.status === 429) {
          if (apiStatus === 'primary' && backupKey) {
            setApiStatus('backup');
            setErrorMsg('Primary API quota exceeded. Switched to backup key.');
            // Retry with backup
            const retryRes = await fetch(url.replace('API_KEY_PLACEHOLDER', backupKey));
            const retryData = await retryRes.json();
            if (retryRes.ok) {
              processVideos(retryData, isSearch);
              return;
            }
          }
          throw new Error('Both API keys exhausted or invalid');
        }
        throw new Error(data.error?.message || 'API request failed');
      }

      processVideos(data, isSearch);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'Failed to load videos');
    }
  };

  const processVideos = (data: any, isSearch: boolean) => {
    const fetchedVideos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle,
      views: 'N/A',
      uploaded: item.snippet.publishedAt.slice(0, 10),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
    setVideos(fetchedVideos);
    setErrorMsg(null);
  };

  // Fetch random videos on mount
  useEffect(() => {
    fetchVideos(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=12&order=date&key=API_KEY_PLACEHOLDER`
    );
  }, []);

  // Search handler
  const handleSearch = () => {
    if (!searchQuery) return;
    fetchVideos(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=20&key=API_KEY_PLACEHOLDER`,
      true
    );
  };

  const addUrl = (url: string) => {
    if (!addedUrls.includes(url)) {
      const newAdded = [...addedUrls, url];
      setAddedUrls(newAdded);
      localStorage.setItem('downloadUrls', newAdded.join('\n'));
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-100 dark:white min-h-screen -m-8 md:m-4 rounded-2xl">
        {/* Top Search Bar */}
        <div className="flex items-center mt-10 md:mt-0 mb-6 bg-white dark:bg-white p-2 rounded-full shadow-md max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search videos..."
            className="flex-1 bg-transparent outline-none px-4 text-gray-800 dark:text-gray-800 placeholder-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-full" title="Search">
            🔍
          </button>
        </div>

        {/* Status / Error Message */}
        {apiStatus === 'backup' && (
          <p className="text-center text-green-600 mb-4 font-medium">
            Switched to backup API key (primary quota exceeded)
          </p>
        )}
        {errorMsg && (
          <p className="text-center text-red-600 mb-4 font-medium">
            {errorMsg}
          </p>
        )}

        {/* Video Rows */}
        <div className="space-y-8">
          {/* Videos Row */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-800 border-2 border-dashed border-gray-900 text-center">
              Videos
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {videos.slice(0, 6).map((video, i) => (
                <div key={i} className="flex-shrink-0 w-48 md:w-64 bg-white dark:bg-white rounded-xl shadow-md overflow-hidden">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-32 md:h-40 object-cover" />
                  </a>
                  <div className="p-3">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-semibold text-sm truncate text-gray-800 dark:text-gray-800 hover:text-indigo-500"
                    >
                      {video.title}
                    </a>
                    <p className="text-xs text-gray-500">{video.channel}</p>
                    <p className="text-xs text-gray-500">{video.uploaded}</p>
                    <button
                      onClick={() => addUrl(video.url)}
                      className={`mt-2 text-xs px-3 py-1 rounded-full ${addedUrls.includes(video.url) ? 'bg-green-500' : 'bg-indigo-500'} text-white w-full`}
                      title="Add URL to Download"
                    >
                      {addedUrls.includes(video.url) ? 'Added' : 'Add URL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shorts Row */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-800 border-2 border-dashed border-gray-900 text-center">
              Shorts
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {videos.slice(6, 12).map((video, i) => (
                <div key={i} className="flex-shrink-0 w-32 md:w-40 bg-white dark:bg-white rounded-xl shadow-md overflow-hidden">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-48 md:h-56 object-cover rounded-t-xl" />
                  </a>
                  <div className="p-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-semibold text-xs truncate text-gray-800 dark:text-gray-800 hover:text-indigo-500"
                    >
                      {video.title}
                    </a>
                    <button
                      onClick={() => addUrl(video.url)}
                      className={`mt-1 text-xs px-2 py-1 rounded-full ${addedUrls.includes(video.url) ? 'bg-green-500' : 'bg-indigo-500'} text-white w-full`}
                      title="Add URL to Download"
                    >
                      {addedUrls.includes(video.url) ? 'Added' : 'Add URL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}