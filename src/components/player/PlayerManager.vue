<script setup lang="ts">
import { useNavigationStore } from '@/store/navigation'
import PlaylistManager from '@/components/player/playlist/PlaylistManager.vue'
import PlaylistEditor from '@/components/player/playlist/PlaylistEditor.vue'
import PlaylistPlayer from '@/components/player/playlist/PlaylistPlayer.vue'

const nav = useNavigationStore()

function showList() {
  nav.navigateTo(['player', 'playlist', 'list'])
}
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 rounded-xl shadow-lg">
    <div class="p-4 overflow-y-auto h-full">
      <PlaylistManager v-if="nav.path[1] === 'playlist' && nav.path[2] === 'list'" />
      <PlaylistEditor v-else-if="nav.path[1] === 'playlist' && nav.path[2] === 'edit'" :uid="nav.selectedUid!" @close="showList" />
      <PlaylistPlayer v-else-if="nav.path[1] === 'playlist' && nav.path[2] === 'player'" :uid="nav.selectedUid!" @close="showList" />
    </div>
  </div>
</template>