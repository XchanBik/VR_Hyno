<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import SessionManager from '@/components/editor/session/SessionManager.vue'
import SongManager from '@/components/editor/song/SongManager.vue'
import AssetManager from '@/components/editor/assets/AssetManager.vue'

const appStore = useAppStore()
const { editorSection, editorSidebarCollapsed } = storeToRefs(appStore)
</script>

<template>
  <div class="w-full h-full">
    <SessionManager v-if="editorSection === 'sessions'" />
    <SongManager v-else-if="editorSection === 'songs'" />
    <AssetManager v-else-if="editorSection === 'assets'" />
  </div>
</template>