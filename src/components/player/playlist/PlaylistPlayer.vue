<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath } from '@/navigationTree'
import ThreeJSManager from '@/three/ThreeJSManager'
import { PlaylistInfo } from '@/types/playlist'
import { SessionInfo } from '@/types/session'

const navStore = useNavigationStore()
const uid = navStore.options.uid as string

const loading = ref(true)
const error = ref<string | null>(null)
const playlist = ref<PlaylistInfo | null>(null)
const sessions = ref<SessionInfo[]>([])
const songs = ref<any[]>([])
const threeManager = ref<InstanceType<typeof ThreeJSManager> | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

async function loadAllData() {
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const playlistResult = await window.electronAPI?.getPlaylist?.(uid)
    if (!playlistResult?.success || !playlistResult.playlist || !playlistResult.playlist.sessions) {
      throw new Error(playlistResult?.error || 'Playlist not found or missing sessions')
    }
    playlist.value = playlistResult.playlist
    // Load all sessions
    const sessionResults = await Promise.all(
      playlist.value!.sessions.map((sid: string) => window.electronAPI?.getSession?.(sid))
    )
    sessions.value = sessionResults.map(r => r.session)
    // Load all songs
    const songUids = [...new Set(sessions.value.map((s: any) => s.song_uid))]
    const songResults = await Promise.all(
      songUids.map((sid: string) => window.electronAPI?.getSong?.(sid))
    )
    songs.value = songResults.map(r => r.song)
    loading.value = false
  } catch (e) {
    error.value = (e as Error).message
    loading.value = false
  }
  console.log('loadAllData END')
}

onMounted(async () => {
  await loadAllData()
  if (!error.value) {
    await nextTick() // S'assure que le DOM est prêt
    if (canvasRef.value) {
      threeManager.value = new ThreeJSManager({
        canvas: canvasRef.value,
        playlist: playlist.value,
        sessions: sessions.value,
        songs: songs.value,
        vr: true // or from flag
      })
      threeManager.value.init()
    }
  }
})
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 pt-16 shadow-lg flex flex-col items-center justify-center relative h-full">
    <button @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)" class="absolute top-4 left-4 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('back') }}
    </button>
    <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else class="w-full h-full">
      <canvas ref="canvasRef" class="w-full h-full bg-black rounded-xl" />
    </div>
  </div>
</template> 