<script setup lang="ts">
import PlayerManager from '@/components/player/PlayerManager.vue'
import EditorManager from '@/components/editor/EditorManager.vue'
import Header from './components/Header.vue'
import { useAppStore } from './store/app'

const appStore = useAppStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bimbo-50">
    <Header />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 flex flex-col justify-center items-center">
      <PlayerManager v-if="appStore.currentView === 'player'" />
      <EditorManager v-else />
    </main>
  </div>
</template>

<style>
/* Tout est géré par Tailwind */
</style>
