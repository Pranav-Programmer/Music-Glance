import { NextRequest, NextResponse } from 'next/server';
import { getDownloader } from '@/lib/downloader';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs'; // Import synchronous fs for createReadStream
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream'; // Import PassThrough

function nodeToWeb(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
  });
}

export async function POST(req: NextRequest) {
  const { urls, type, quality } = await req.json();
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  const ytdlp = await getDownloader();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'downloads-'));
  const files: string[] = [];

  try {
    for (const url of urls) {
      const info = await ytdlp.getInfoAsync(url);
      let filename: string;
      const baseName = sanitizeFilename(info.title);
      if (type === 'audio') {
        filename = `${baseName}.mp3`;
      } else {
        filename = `${baseName}.mp4`;
      }
      const filePath = path.join(tempDir, filename);
      if (type === 'audio') {
        await ytdlp.downloadAudio(url, 'mp3', { output: filePath });
      } else {
        await ytdlp.downloadVideo(url, quality || 'highest', { output: filePath, type: 'mp4' });
      }
      files.push(filePath); // Store full paths
    }

    const contentType = files.length > 1 ? 'application/zip' : 'application/octet-stream';
    const filenameHeader = files.length > 1 ? 'downloads.zip' : path.basename(files[0]);
    const headers = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filenameHeader}"`,
    };

    let stream: ReadableStream;

    if (files.length === 1) {
      // Single file: Stream directly from fs
      const nodeStream = fsSync.createReadStream(files[0]);
      stream = nodeToWeb(nodeStream);
    } else {
      // Multiple files: ZIP on-the-fly
      const output = new PassThrough(); // Readable stream for archiver output
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(output);
      for (const filePath of files) {
        archive.file(filePath, { name: path.basename(filePath) });
      }
      archive.finalize(); // Start archiving (async, but stream starts flowing)
      stream = nodeToWeb(output);
    }

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  } finally {
    // Cleanup temp dir after response is sent (Next.js streams it async)
    setTimeout(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    }, 5000); // Delay cleanup to allow stream to finish (adjust as needed)
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[\/\\:*?"<>|]/g, '_');
}