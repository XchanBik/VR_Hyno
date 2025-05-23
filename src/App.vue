<script setup lang="ts">
import PlaylistManager from './components/PlaylistManager.vue'
import Editor from './components/Editor.vue'
import Header from './components/Header.vue'
import { t } from './i18n'
import { useAppStore } from './store/app'

const appStore = useAppStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bimbo-50">
    <Header />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 flex flex-col justify-center items-center">
      <PlaylistManager v-if="appStore.currentView === 'player'" />
      <Editor v-else />
    </main>
  </div>
</template>

<style>
/* Tout est géré par Tailwind */
</style>
