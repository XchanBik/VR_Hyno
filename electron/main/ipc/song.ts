import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';

const SONGS_PATH = join(process.cwd(), 'data', 'songs');

async function ensureSongsDirectory() {
  if (!existsSync(SONGS_PATH)) {
    await import('fs/promises').then(fs => fs.mkdir(SONGS_PATH, { recursive: true }));
  }
}

async function readSongInfo(songDir: string) {
  try {
    const infoPath = join(SONGS_PATH, songDir, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export function registerSongIpcHandlers(ipcMainInstance: typeof ipcMain) {
  ipcMainInstance.handle('get-songs', async () => {
    try {
      await ensureSongsDirectory();
      const folders = await readdir(SONGS_PATH);
      const songs = await Promise.all(
        folders.map(async (folder) => {
          const songPath = join(SONGS_PATH, folder);
          const stats = await stat(songPath);
          if (stats.isDirectory()) {
            const info = await readSongInfo(folder);
            if (info) {
              return { uid: folder, info };
            }
          }
          return null;
        })
      );
      return {
        success: true,
        songs: songs.filter((song) => song !== null),
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('get-song', async (_event, uid: string) => {
    try {
      await ensureSongsDirectory();
      const info = await readSongInfo(uid);
      if (info) {
        return { success: true, song: info };
      }
      return { success: false, error: 'Song not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 