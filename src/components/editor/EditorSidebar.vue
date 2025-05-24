<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const sections = [
  { key: 'sessions', label: 'Sessions', icon: '🧠' },
  { key: 'songs', label: 'Songs', icon: '🎵' },
  { key: 'assets', label: 'Assets', icon: '💎' },
]
const collapsed = computed(() => appStore.editorSidebarCollapsed)
const current = computed(() => appStore.editorSection)

function selectSection(key: string) {
  appStore.setEditorSection(key as any)
}

function toggleSidebar() {
  // Appelle l'action directement sur appStore, pas sur une ref
  appStore.setEditorSidebarCollapsed(!appStore.editorSidebarCollapsed)
}
</script>

<template>
  <aside :class="['flex-1 h-full min-h-0 flex flex-col bg-bimbo-100 shadow-xl transition-all duration-300', collapsed ? 'w-20' : 'w-56']">
    <button @click="toggleSidebar" class="mt-4 mb-2 ml-auto mr-2 bg-bimbo-200 hover:bg-bimbo-300 text-bimbo-700 rounded-full p-2 shadow transition flex items-center" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
      <svg :class="['w-6 h-6 transition-transform']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path v-if="collapsed" d="M9 5l7 7-7 7" />
        <path v-else d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <nav class="flex-1 flex flex-col gap-2 mt-6">
      <button v-for="section in sections" :key="section.key"
        @click="selectSection(section.key)"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-all',
          current === section.key ? 'bg-bimbo-500 text-white shadow-lg scale-105' : 'bg-bimbo-200 text-bimbo-700 hover:bg-bimbo-300',
          collapsed ? 'justify-center px-2' : 'justify-start'
        ]"
        :title="section.label"
      >
        <span class="text-2xl">{{ section.icon }}</span>
        <span v-if="!collapsed" class="text-base">{{ section.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
/* Bimbo style accent */
</style> 