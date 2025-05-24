<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import PlaylistManager from '@/components/player/playlist/PlaylistManager.vue'
import PlaylistEditor from '@/components/player/playlist/PlaylistEditor.vue'
import PlaylistPlayer from '@/components/player/PlaylistPlayer.vue'

const appStore = useAppStore()
const { playerView, selectedPlaylistUid } = storeToRefs(appStore)

function showList() {
  appStore.setPlayerView('list', null)
}
function showEditor(uid: string) {
  appStore.setPlayerView('edit', uid)
}
function showPlayer(uid: string) {
  appStore.setPlayerView('play', uid)
}
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-bimbo-100 via-bimbo-50 to-bimbo-200 rounded-xl shadow-lg">
    <div class="p-4 overflow-y-auto h-full">
      <PlaylistManager v-if="playerView === 'list'" />
      <PlaylistEditor v-else-if="playerView === 'edit'" :uid="selectedPlaylistUid!" @close="showList" />
      <PlaylistPlayer v-else-if="playerView === 'play'" :uid="selectedPlaylistUid!" @close="showList" />
    </div>
  </div>
</template>