<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import SessionManager from '@/components/editor/session/SessionManager.vue'
import SongManager from '@/components/editor/song/SongManager.vue'
// (AssetManager à ajouter plus tard)

const appStore = useAppStore()
const { editorSection, editorSidebarCollapsed } = storeToRefs(appStore)
</script>

<template>
  <div class="w-full h-full">
    <SessionManager v-if="editorSection === 'sessions'" />
    <SongManager v-else-if="editorSection === 'songs'" />
    <div v-else class="bg-bimbo-50 rounded-xl p-8 shadow-lg text-center text-bimbo-700">
      <div class="text-2xl font-bold mb-2">Asset Manager</div>
      <div class="text-bimbo-400">(Assets placeholder)</div>
    </div>
  </div>
</template> 