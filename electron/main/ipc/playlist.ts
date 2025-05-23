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
      const entries = await readdir(PLAYLISTS_PATH, { withFileTypes: true });
      const folders = entries.filter(e => e.isDirectory());
      const playlists = await Promise.all(
        folders.map(async (folder) => {
          const uid = folder.name;
          const infoPath = join(PLAYLISTS_PATH, uid, 'info.json');
          try {
            const content = await readFile(infoPath, 'utf-8');
            const info = JSON.parse(content);
            return { uid, info };
          } catch (e) {
            console.warn(`[playlist] Could not read info.json for ${uid}:`, e);
            return null;
          }
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
      const infoPath = join(PLAYLISTS_PATH, uid, 'info.json');
      const content = await readFile(infoPath, 'utf-8');
      const info = JSON.parse(content);
      return { success: true, playlist: info };
    } catch (error) {
      return { success: false, error: 'Playlist not found' };
    }
  });

  ipcMainInstance.handle('create-playlist', async (_event, data: { name: string; repeat: boolean; sessions: string[] }) => {
    try {
      console.log('[playlist] create-playlist called with:', data)
      await ensurePlaylistsDirectory();
      const uid = Math.random().toString(36).slice(2, 10);
      const playlistDir = join(PLAYLISTS_PATH, uid);
      console.log('[playlist] Creating playlist dir:', playlistDir)
      if (!existsSync(playlistDir)) {
        await mkdir(playlistDir, { recursive: true });
        console.log('[playlist] Directory created')
      } else {
        console.log('[playlist] Directory already exists')
      }
      const info = {
        name: data.name,
        repeat: data.repeat,
        sessions: data.sessions || [],
      };
      const infoPath = join(playlistDir, 'info.json');
      console.log('[playlist] Writing info.json at:', infoPath, 'with:', info)
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8'));
      console.log('[playlist] Playlist created successfully:', { uid, info })
      return { success: true, playlist: { uid, info } };
    } catch (error) {
      console.error('[playlist] create-playlist error:', error)
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('update-playlist', async (_event, data: { uid: string, info: any }) => {
    try {
      await ensurePlaylistsDirectory();
      const infoPath = join(PLAYLISTS_PATH, data.uid, 'info.json');
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(data.info, null, 2), 'utf-8'));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 