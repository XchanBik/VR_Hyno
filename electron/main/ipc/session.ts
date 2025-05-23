import { ipcMain } from 'electron';
import { join } from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';

const SESSIONS_PATH = join(process.cwd(), 'data', 'sessions');

async function ensureSessionsDirectory() {
  if (!existsSync(SESSIONS_PATH)) {
    await import('fs/promises').then(fs => fs.mkdir(SESSIONS_PATH, { recursive: true }));
  }
}

async function readSessionInfo(sessionDir: string) {
  try {
    const infoPath = join(SESSIONS_PATH, sessionDir, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export function registerSessionIpcHandlers(ipcMainInstance: typeof ipcMain) {
  ipcMainInstance.handle('get-sessions', async () => {
    try {
      await ensureSessionsDirectory();
      const folders = await readdir(SESSIONS_PATH);
      const sessions = await Promise.all(
        folders.map(async (folder) => {
          const sessionPath = join(SESSIONS_PATH, folder);
          const stats = await stat(sessionPath);
          if (stats.isDirectory()) {
            const info = await readSessionInfo(folder);
            if (info) {
              return { uid: folder, info };
            }
          }
          return null;
        })
      );
      return {
        success: true,
        sessions: sessions.filter((session) => session !== null),
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMainInstance.handle('get-session', async (_event, uid: string) => {
    try {
      await ensureSessionsDirectory();
      const info = await readSessionInfo(uid);
      if (info) {
        return { success: true, session: info };
      }
      return { success: false, error: 'Session not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 