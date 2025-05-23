import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const DATA_PATH = join(process.cwd(), 'data');
const PLAYLISTS_PATH = join(DATA_PATH, 'playlists');

async function ensurePlaylistsDirectory() {
  console.log('[playlist] Checking DATA_PATH:', DATA_PATH);
  if (!existsSync(DATA_PATH)) {
    console.log('[playlist] DATA_PATH does not exist, creating...');
    await mkdir(DATA_PATH, { recursive: true });
    console.log('[playlist] DATA_PATH created');
  }
  console.log('[playlist] Checking PLAYLISTS_PATH:', PLAYLISTS_PATH);
  if (!existsSync(PLAYLISTS_PATH)) {
    console.log('[playlist] PLAYLISTS_PATH does not exist, creating...');
    await mkdir(PLAYLISTS_PATH, { recursive: true });
    console.log('[playlist] PLAYLISTS_PATH created');
  }
}

async function readPlaylistInfo(playlistFile: string) {
  try {
    const infoPath = join(PLAYLISTS_PATH, playlistFile);
    const content = await readFile(infoPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export function registerPlaylistIpcHandlers(ipcMainInstance: typeof ipcMain) {
  ipcMainInstance.handle('get-playlists', async () => {
    console.log('[playlist] IPC get-playlists called');
    try {
      await ensurePlaylistsDirectory();
      const files = await readdir(PLAYLISTS_PATH);
      const playlists = await Promise.all(
        files.filter(f => f.endsWith('.json')).map(async (file) => {
          const filePath = join(PLAYLISTS_PATH, file);
          const stats = await stat(filePath);
          if (stats.isFile()) {
            const info = await readPlaylistInfo(file);
            if (info) {
              return { uid: file.replace(/\.json$/, ''), info };
            }
          }
          return null;
        })
      );
      const filtered = playlists.filter((playlist) => playlist !== null);
      console.log(`[playlist] Returning ${filtered.length} playlists`);
      return {
        success: true,
        playlists: filtered,
      };
    } catch (error) {
      console.error('get-playlists error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('get-playlist', async (_event, uid: string) => {
    console.log(`[playlist] IPC get-playlist called for uid: ${uid}`);
    try {
      await ensurePlaylistsDirectory();
      const info = await readPlaylistInfo(uid + '.json');
      if (info) {
        return { success: true, playlist: info };
      }
      return { success: false, error: 'Playlist not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 