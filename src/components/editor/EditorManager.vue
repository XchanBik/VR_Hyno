<script setup lang="ts">
import { ref } from 'vue'
import SessionManager from '@/components/editor/session/SessionManager.vue'
import SongManager from '@/components/editor/song/SongManager.vue'

const view = ref<'sessions' | 'songs'>('sessions')

function showSessions() {
  view.value = 'sessions'
}
function showSongs() {
  view.value = 'songs'
}
</script>

<template>
  <div>
    <div class="flex gap-4 mb-6">
      <button @click="showSessions" :class="['btn', 'rounded-full', view === 'sessions' ? 'bg-bimbo-500 text-white' : 'bg-bimbo-200 text-bimbo-700', 'px-6 py-2 font-bold shadow']">Sessions</button>
      <button @click="showSongs" :class="['btn', 'rounded-full', view === 'songs' ? 'bg-bimbo-500 text-white' : 'bg-bimbo-200 text-bimbo-700', 'px-6 py-2 font-bold shadow']">Songs</button>
    </div>
    <SessionManager v-if="view === 'sessions'" />
    <SongManager v-else />
  </div>
</template> 