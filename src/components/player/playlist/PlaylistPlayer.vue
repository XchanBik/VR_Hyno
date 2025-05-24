<script setup lang="ts">
import { useNavigationStore } from '@/store/navigation'
import { nav } from '@/navigationTree'

const props = defineProps<{ uid: string }>()
const navStore = useNavigationStore()
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 pt-16 shadow-lg flex flex-col items-center justify-center relative">
    <button @click="navStore.navigateTo(nav.player.playlist.list)" class="absolute top-4 left-4 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      Back
    </button>
    <div class="text-brand-700 font-bold text-xl mb-4">Playlist Player</div>
    <div class="text-brand-400 text-xs mb-2">UID: <span class="font-mono">{{ props.uid }}</span></div>
    <!-- TODO: Playlist playback UI -->
    <div class="text-brand-500">(Player UI coming soon!)</div>
  </div>
</template> 