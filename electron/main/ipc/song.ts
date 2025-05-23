import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const DATA_PATH = join(process.cwd(), 'data');
const SONGS_PATH = join(DATA_PATH, 'songs');

async function ensureSongsDirectory() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, { recursive: true });
  }
  if (!existsSync(SONGS_PATH)) {
    await mkdir(SONGS_PATH, { recursive: true });
  }
}

export function registerSongIpcHandlers(ipcMainInstance: typeof ipcMain) {
  ipcMainInstance.handle('get-songs', async () => {
    try {
      await ensureSongsDirectory();
      const entries = await readdir(SONGS_PATH, { withFileTypes: true });
      const folders = entries.filter(e => e.isDirectory());
      const songs = await Promise.all(
        folders.map(async (folder) => {
          const uid = folder.name;
          const infoPath = join(SONGS_PATH, uid, 'info.json');
          try {
            const content = await readFile(infoPath, 'utf-8');
            const info = JSON.parse(content);
            return { uid, info };
          } catch (e) {
            return null;
          }
        })
      );
      return { success: true, songs: songs.filter(Boolean) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('get-song', async (_event, uid: string) => {
    try {
      await ensureSongsDirectory();
      const infoPath = join(SONGS_PATH, uid, 'info.json');
      const content = await readFile(infoPath, 'utf-8');
      const info = JSON.parse(content);
      return { success: true, song: info };
    } catch (error) {
      return { success: false, error: 'Song not found' };
    }
  });

  ipcMainInstance.handle('create-song', async (_event, data: { info: any }) => {
    try {
      await ensureSongsDirectory();
      const uid = Math.random().toString(36).slice(2, 10);
      const songDir = join(SONGS_PATH, uid);
      if (!existsSync(songDir)) {
        await mkdir(songDir, { recursive: true });
      }
      const infoPath = join(songDir, 'info.json');
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(data.info, null, 2), 'utf-8'));
      return { success: true, song: { uid, info: data.info } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('update-song', async (_event, data: { uid: string, info: any }) => {
    try {
      await ensureSongsDirectory();
      const infoPath = join(SONGS_PATH, data.uid, 'info.json');
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(data.info, null, 2), 'utf-8'));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 