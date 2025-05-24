<script setup lang="ts">
import Header from '@/components/Header.vue'
import PlayerManager from '@/components/player/PlayerManager.vue'
import EditorManager from '@/components/editor/EditorManager.vue'
import SideBarEditor from '@/components/editor/EditorSidebar.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- HEADER SECTION -->
    <div class="w-full h-20 flex-shrink-0" style="background: #ff4dd2;">
      <Header />
    </div>

    <!-- CONTENT GRID -->
    <div class="flex-1 flex min-h-0">
      <!-- LEFT SIDEBAR - Seulement en mode Editor -->
      <SideBarEditor v-if="appStore.currentView === 'editor'" />

      <!-- RIGHT CONTENT -->
      <div class="flex-1 min-w-0" style="background: #51e898;">
        <div class="h-full w-full">
          <PlayerManager v-if="appStore.currentView === 'player'" />
          <EditorManager v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Design 100% Tailwind, pas de CSS custom nécessaire */
</style>