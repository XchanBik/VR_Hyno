<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PlaylistInfo {
  uid: string
  info: {
    name: string
    repeat: boolean
    sessions: string[]
  }
}

const playlists = ref<PlaylistInfo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const showCreate = ref(false)
const newPlaylistName = ref('')
const newPlaylistRepeat = ref(false)
const creating = ref(false)

async function loadPlaylists() {
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getPlaylists?.()
    if (result?.success) {
      playlists.value = result.playlists || []
    } else {
      error.value = result?.error || 'Unknown error'
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function createPlaylist() {
  if (!newPlaylistName.value.trim()) return
  creating.value = true
  try {
    // Génère un UID simple côté front (à remplacer par backend plus tard)
    const uid = Math.random().toString(36).slice(2, 10)
    const playlist = {
      uid,
      name: newPlaylistName.value.trim(),
      repeat: newPlaylistRepeat.value,
      sessions: []
    }
    // Enregistre le fichier côté backend (à améliorer plus tard)
    // @ts-ignore
    const fs = window.require?.('fs')
    const path = window.require?.('path')
    const playlistsPath = path.join(process.cwd(), 'data', 'playlists')
    if (!fs.existsSync(playlistsPath)) fs.mkdirSync(playlistsPath, { recursive: true })
    fs.writeFileSync(
      path.join(playlistsPath, uid + '.json'),
      JSON.stringify(playlist, null, 2)
    )
    newPlaylistName.value = ''
    newPlaylistRepeat.value = false
    showCreate.value = false
    await loadPlaylists()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    creating.value = false
  }
}

function openCreate() {
  showCreate.value = true
  newPlaylistName.value = ''
  newPlaylistRepeat.value = false
}

onMounted(loadPlaylists)
</script>

<template>
  <div class="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 relative">
    <h2 class="text-2xl font-bold text-bimbo-700 mb-6 flex items-center gap-2">
      <svg class="w-7 h-7 text-bimbo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" /><path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      Playlists
      <button @click="openCreate" class="ml-auto bg-bimbo-500 hover:bg-bimbo-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow transition absolute right-8 top-8" title="Ajouter une playlist">
        <span class="text-2xl leading-none">+</span>
      </button>
    </h2>
    <div v-if="loading" class="text-center py-8 text-bimbo-400">Loading playlists...</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else>
      <div v-if="playlists.length === 0" class="text-center py-8 text-bimbo-400">
        Aucune playlist pour l'instant.<br />
        <span class="text-bimbo-600">Clique sur <b>+</b> pour en créer une !</span>
      </div>
      <ul v-else class="space-y-4 mb-8">
        <li v-for="playlist in playlists" :key="playlist.uid" class="bg-bimbo-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <div class="font-bold text-bimbo-700">{{ playlist.info.name }}</div>
            <div class="text-xs text-bimbo-500">Repeat: <span v-if="playlist.info.repeat">Yes</span><span v-else>No</span></div>
          </div>
          <span class="text-bimbo-400 text-xs">{{ playlist.uid }}</span>
        </li>
      </ul>
    </div>
    <form v-if="showCreate" @submit.prevent="createPlaylist" class="flex flex-col gap-4 mb-2 mt-2 bg-bimbo-50 rounded-lg p-4 shadow">
      <input v-model="newPlaylistName" type="text" placeholder="Playlist name" class="rounded-full px-4 py-2 border border-bimbo-200 focus:ring-2 focus:ring-bimbo-400 outline-none" />
      <label class="flex items-center gap-2">
        <input v-model="newPlaylistRepeat" type="checkbox" class="accent-bimbo-500" />
        Repeat
      </label>
      <div class="flex gap-2">
        <button type="submit" class="btn rounded-full px-6 py-2 shadow bg-bimbo-500 text-white hover:bg-bimbo-600 transition font-bold tracking-wide uppercase" :disabled="creating">
          Créer
        </button>
        <button type="button" @click="showCreate = false" class="btn rounded-full px-6 py-2 shadow bg-bimbo-200 text-bimbo-700 hover:bg-bimbo-300 transition font-bold tracking-wide uppercase">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template> 