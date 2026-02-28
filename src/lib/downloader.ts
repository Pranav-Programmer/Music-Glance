import { YtDlp } from 'ytdlp-nodejs';

let ytdlp: YtDlp | null = null;

export async function getDownloader() {
  if (!ytdlp) {
    ytdlp = new YtDlp();
    // Download FFmpeg if not installed (runs once)
    try {
      await ytdlp.checkInstallationAsync();
    } catch {
      await YtDlp.downloadFFmpeg();
    }
  }
  return ytdlp;
}