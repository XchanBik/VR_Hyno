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
  <div class="w-full h-full flex items-center justify-center">
    <div>
      <PlaylistManager v-if="playerView === 'list'" />
      <PlaylistEditor v-else-if="playerView === 'edit'" :uid="selectedPlaylistUid!" @close="showList" />
      <PlaylistPlayer v-else-if="playerView === 'play'" :uid="selectedPlaylistUid!" @close="showList" />
    </div>
  </div>
</template> 