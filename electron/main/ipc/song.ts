import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, mkdir, copyFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dialog, app } from 'electron';
import * as mm from 'music-metadata';

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

  ipcMainInstance.handle('add-song', async (_event) => {
    try {
      await ensureSongsDirectory();
      // Ouvre le sélecteur de fichier natif (mp3 uniquement)
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select an audio file',
        filters: [{ name: 'Audio', extensions: ['mp3'] }],
        properties: ['openFile']
      });
      if (canceled || !filePaths || !filePaths[0]) {
        return { success: false, error: 'cancelled' };
      }
      const originalPath = filePaths[0];
      const originalName = originalPath.split(/[\\/]/).pop() || 'song.mp3';      
      const uid = Math.random().toString(36).slice(2, 10);
      const songDir = join(SONGS_PATH, uid);
      if (!existsSync(songDir)) {
        await mkdir(songDir, { recursive: true });
      }
      const destMp3 = join(songDir, `${uid}.mp3`);
      await copyFile(originalPath, destMp3);
      // Utilise music-metadata pour extraire la durée
      const metadata = await mm.parseFile(destMp3);
      const duration = metadata.format.duration || 0;
      // Crée info.json
      const info = {
        name: originalName.replace(/\.[^/.]+$/, ''),
        duration
      };
      const infoPath = join(songDir, 'info.json');
      await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
      return { success: true, song: { uid, info } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 