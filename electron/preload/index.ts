import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    // PLAYLISTS
    getPlaylists: () => ipcRenderer.invoke('get-playlists'),
    getPlaylist: (uid: string) => ipcRenderer.invoke('get-playlist', uid),
    createPlaylist: (data: { name: string; repeat: boolean; sessions: string[] }) => ipcRenderer.invoke('create-playlist', data),
    updatePlaylist: (data: { uid: string; info: any }) => ipcRenderer.invoke('update-playlist', data),
    // SONGS
    getSongs: () => ipcRenderer.invoke('get-songs'),
    getSong: (uid: string) => ipcRenderer.invoke('get-song', uid),
    createSong: (data: { info: any }) => ipcRenderer.invoke('create-song', data),
    updateSong: (data: { uid: string; info: any }) => ipcRenderer.invoke('update-song', data),
    // SESSIONS
    getSessions: () => ipcRenderer.invoke('get-sessions'),
    getSession: (uid: string) => ipcRenderer.invoke('get-session', uid),
    createSession: (data: { info: any }) => ipcRenderer.invoke('create-session', data),
    updateSession: (data: { uid: string; info: any }) => ipcRenderer.invoke('update-session', data),
  }
)

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `bimbo-heart-spin`
  const styleContent = `
@keyframes bimbo-heart {
  0%, 100% { transform: scale(1) rotate(-10deg); }
  20% { transform: scale(1.1) rotate(10deg); }
  40% { transform: scale(0.95) rotate(-10deg); }
  60% { transform: scale(1.1) rotate(10deg); }
  80% { transform: scale(1) rotate(-10deg); }
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff0fb 0%, #ff80df 100%);
  z-index: 9999;
}
.${className} {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${className} .heart {
  width: 64px;
  height: 64px;
  animation: bimbo-heart 1.2s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.${className} .text {
  margin-top: 1.5rem;
  color: #ff1ac6;
  font-size: 1.3rem;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
  font-weight: bold;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #fff0fb;
}
`
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `
    <div class="${className}">
      <svg class="heart" viewBox="0 0 32 29.6">
        <path fill="#ff1ac6" d="M23.6,0c-2.7,0-5.1,1.3-6.6,3.3C15.5,1.3,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,11.1,16,19.2,16,19.2s16-8.1,16-19.2C32,4.7,27.3,0,23.6,0z"/>
      </svg>
      <div class="text">Loading VR Hypno…</div>
    </div>
  `

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
