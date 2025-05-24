<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '../i18n'
import PlaylistEditor from './PlaylistEditor.vue'

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
const editingPlaylistUid = ref<string | null>(null)

async function loadPlaylists() {
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getPlaylists?.()
    if (result?.success) {
      playlists.value = result.playlists || []
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

function openEditor(uid: string) {
  editingPlaylistUid.value = uid
}

async function createPlaylist() {
  if (!newPlaylistName.value.trim()) return
  creating.value = true
  try {
    const result = await window.electronAPI?.createPlaylist?.({
      name: newPlaylistName.value.trim(),
      repeat: false, // default, will be editable in editor
      sessions: []
    })
    console.log('IPC createPlaylist result:', result)
    if (result?.success) {
      newPlaylistName.value = ''
      newPlaylistRepeat.value = false
      showCreate.value = false
      await loadPlaylists()
      openEditor(result.playlist.uid)
    } else {
      error.value = result?.error || t('unknownError')
      console.error('Playlist creation error:', error.value)
    }
  } catch (e) {
    error.value = (e as Error).message
    console.error('Exception in createPlaylist:', e)
  } finally {
    creating.value = false
    console.log('createPlaylist finished')
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
    <h2 class="text-2xl font-bold text-brand-700 mb-6 flex items-center gap-2">
      <svg class="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" /><path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      {{ t('playlists') }}
      <button @click="openCreate" class="ml-auto bg-brand-500 hover:bg-brand-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow transition absolute right-8 top-8" :title="t('addPlaylist')">
        <span class="text-2xl leading-none">+</span>
      </button>
    </h2>
    <div v-if="editingPlaylistUid">
      <PlaylistEditor :uid="editingPlaylistUid" @close="editingPlaylistUid = null; loadPlaylists()" />
    </div>
    <div v-else>
      <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
      <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
      <div v-else>
        <div v-if="playlists.length === 0" class="text-center py-8 text-brand-400">
          {{ t('noPlaylists') }}
        </div>
        <ul v-else class="space-y-4 mb-8">
          <li v-for="playlist in playlists" :key="playlist.uid" class="bg-brand-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button class="bg-brand-500 hover:bg-brand-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow transition text-2xl" title="Play">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div>
                <div class="font-bold text-brand-700 text-lg">{{ playlist.info.name }}</div>
                <div class="text-xs text-brand-500">{{ t('repeat') }}: <span v-if="playlist.info.repeat">{{ t('yes') }}</span><span v-else>{{ t('no') }}</span></div>
              </div>
            </div>
            <button @click="openEditor(playlist.uid)" class="ml-2 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full w-9 h-9 flex items-center justify-center shadow transition" title="Edit">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"/></svg>
            </button>
          </li>
        </ul>
      </div>
      <form v-if="showCreate" @submit.prevent="createPlaylist" class="flex flex-col gap-4 mb-2 mt-2 bg-brand-50 rounded-lg p-4 shadow">
        <input v-model="newPlaylistName" type="text" :placeholder="t('playlistName')" class="rounded-full px-4 py-2 border border-brand-200 focus:ring-2 focus:ring-brand-400 outline-none" />
        <div class="flex gap-2">
          <button type="submit" class="btn rounded-full px-6 py-2 shadow bg-brand-500 text-white hover:bg-brand-600 transition font-bold tracking-wide uppercase" :disabled="creating">
            {{ t('createPlaylist') }}
          </button>
          <button type="button" @click="showCreate = false" class="btn rounded-full px-6 py-2 shadow bg-brand-200 text-brand-700 hover:bg-brand-300 transition font-bold tracking-wide uppercase">
            {{ t('cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 