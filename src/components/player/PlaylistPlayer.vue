<script setup lang="ts">
import { useAppStore } from '@/store/app'
const props = defineProps<{ uid: string }>()
const appStore = useAppStore()
</script>

<template>
  <div class="bg-bimbo-50 rounded-xl p-6 pt-16 shadow-lg flex flex-col items-center justify-center relative">
    <button @click="appStore.setPlayerView('list', null)" class="absolute top-4 left-4 bg-bimbo-200 hover:bg-bimbo-300 text-bimbo-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      Back
    </button>
    <div class="text-bimbo-700 font-bold text-xl mb-4">Playlist Player</div>
    <div class="text-bimbo-400 text-xs mb-2">UID: <span class="font-mono">{{ props.uid }}</span></div>
    <!-- TODO: Playlist playback UI -->
    <div class="text-bimbo-500">(Player UI coming soon!)</div>
  </div>
</template> 