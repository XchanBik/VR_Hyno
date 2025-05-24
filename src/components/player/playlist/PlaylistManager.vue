<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '@/i18n'
import PlaylistEditor from '@/components/player/playlist/PlaylistEditor.vue'
import { useAppStore } from '@/store/app'

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

const appStore = useAppStore()

const emit = defineEmits(['edit', 'play'])

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
  appStore.setPlayerView('edit', uid)
}

async function createPlaylist() {
  if (!newPlaylistName.value.trim()) return
  creating.value = true
  try {
    const result = await window.electronAPI?.createPlaylist?.({
      name: newPlaylistName.value.trim(),
      repeat: false,
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
  <!-- Container principal qui prend tout l'espace -->
  <div class="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 p-6">
    <!-- Header avec titre et bouton d'ajout -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
            <circle cx="20" cy="16" r="2"/>
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent">
            {{ t('playlists') }}
          </h1>
          <p class="text-gray-500 text-sm">{{ playlists.length }} {{ playlists.length === 1 ? 'playlist' : 'playlists' }}</p>
        </div>
      </div>
      
      <button 
        @click="openCreate" 
        class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        :title="t('addPlaylist')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4"/>
        </svg>
        <span class="font-semibold">{{ t('addPlaylist') }}</span>
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1">
      <!-- Éditeur de playlist -->
      <div v-if="editingPlaylistUid" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <PlaylistEditor :uid="editingPlaylistUid" @close="editingPlaylistUid = null; loadPlaylists()" />
      </div>
      
      <!-- Liste des playlists -->
      <div v-else>
        <!-- États de chargement et d'erreur -->
        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-500">{{ t('loading') }}</p>
          </div>
        </div>
        
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-red-600 font-medium">{{ error }}</p>
        </div>
        
        <!-- Contenu principal -->
        <div v-else>
          <!-- État vide -->
          <div v-if="playlists.length === 0 && !showCreate" class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
                <circle cx="20" cy="16" r="2"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ t('noPlaylists') }}</h3>
            <p class="text-gray-500 mb-8">Créez votre première playlist pour commencer</p>
            <button 
              @click="openCreate" 
              class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Créer une playlist
            </button>
          </div>
          
          <!-- Grille des playlists -->
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div 
              v-for="playlist in playlists" 
              :key="playlist.uid" 
              class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group"
            >
              <!-- Header de la carte -->
              <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-bold text-lg truncate pr-2">{{ playlist.info.name }}</h3>
                  <button 
                    @click="openEditor(playlist.uid)" 
                    class="opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all duration-200"
                    title="Éditer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"/>
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-2 text-sm text-white/80">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ t('repeat') }}: {{ playlist.info.repeat ? t('yes') : t('no') }}</span>
                </div>
              </div>
              
              <!-- Corps de la carte -->
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    {{ playlist.info.sessions.length }} session{{ playlist.info.sessions.length !== 1 ? 's' : '' }}
                  </div>
                  <button 
                    @click="appStore.setPlayerView('play', playlist.uid)"
                    class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Lire"
                  >
                    <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulaire de création -->
        <div v-if="showCreate" class="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Nouvelle playlist</h3>
          </div>
          
          <form @submit.prevent="createPlaylist" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la playlist</label>
              <input 
                v-model="newPlaylistName" 
                type="text" 
                :placeholder="t('playlistName')" 
                class="w-full rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all duration-200"
                :disabled="creating"
              />
            </div>
            
            <div class="flex gap-3 pt-2">
              <button 
                type="submit" 
                class="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="creating || !newPlaylistName.trim()"
              >
                <span v-if="creating" class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création...
                </span>
                <span v-else>{{ t('createPlaylist') }}</span>
              </button>
              
              <button 
                type="button" 
                @click="showCreate = false" 
                class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                :disabled="creating"
              >
                {{ t('cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>