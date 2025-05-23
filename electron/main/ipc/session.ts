import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const DATA_PATH = join(process.cwd(), 'data');
const SESSIONS_PATH = join(DATA_PATH, 'sessions');

async function ensureSessionsDirectory() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, { recursive: true });
  }
  if (!existsSync(SESSIONS_PATH)) {
    await mkdir(SESSIONS_PATH, { recursive: true });
  }
}

export function registerSessionIpcHandlers(ipcMainInstance: typeof ipcMain) {
  ipcMainInstance.handle('get-sessions', async () => {
    try {
      await ensureSessionsDirectory();
      const entries = await readdir(SESSIONS_PATH, { withFileTypes: true });
      const folders = entries.filter(e => e.isDirectory());
      const sessions = await Promise.all(
        folders.map(async (folder) => {
          const uid = folder.name;
          const infoPath = join(SESSIONS_PATH, uid, 'info.json');
          try {
            const content = await readFile(infoPath, 'utf-8');
            const info = JSON.parse(content);
            return { uid, info };
          } catch (e) {
            return null;
          }
        })
      );
      return { success: true, sessions: sessions.filter(Boolean) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('get-session', async (_event, uid: string) => {
    try {
      await ensureSessionsDirectory();
      const infoPath = join(SESSIONS_PATH, uid, 'info.json');
      const content = await readFile(infoPath, 'utf-8');
      const info = JSON.parse(content);
      return { success: true, session: info };
    } catch (error) {
      return { success: false, error: 'Session not found' };
    }
  });

  ipcMainInstance.handle('create-session', async (_event, data: { info: any }) => {
    try {
      await ensureSessionsDirectory();
      const uid = Math.random().toString(36).slice(2, 10);
      const sessionDir = join(SESSIONS_PATH, uid);
      if (!existsSync(sessionDir)) {
        await mkdir(sessionDir, { recursive: true });
      }
      const infoPath = join(sessionDir, 'info.json');
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(data.info, null, 2), 'utf-8'));
      return { success: true, session: { uid, info: data.info } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('update-session', async (_event, data: { uid: string, info: any }) => {
    try {
      await ensureSessionsDirectory();
      const infoPath = join(SESSIONS_PATH, data.uid, 'info.json');
      await import('fs/promises').then(fs => fs.writeFile(infoPath, JSON.stringify(data.info, null, 2), 'utf-8'));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 