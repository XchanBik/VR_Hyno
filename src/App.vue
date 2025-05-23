<script setup lang="ts">
import { ref } from 'vue'
import SessionList from './components/SessionList.vue'
import Editor from './components/Editor.vue'

const currentView = ref<'player' | 'editor'>('player')

const navigateTo = (view: 'player' | 'editor') => {
  currentView.value = view
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bimbo-50">
    <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-bimbo-400 via-bimbo-200 to-bimbo-400 shadow-md z-10 border-b border-bimbo-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-4">
            <!-- Icône coeur glamour -->
            <span class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bimbo-500 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21s-6.5-4.35-9-7.5C-1.5 8.5 2.5 3.5 7 6.5c2.1 1.4 3 2.5 5 5 2-2.5 2.9-3.6 5-5C21.5 3.5 25.5 8.5 21 13.5c-2.5 3.15-9 7.5-9 7.5z" />
              </svg>
            </span>
            <!-- Titre avec gradient rose -->
            <span class="text-3xl font-extrabold bg-gradient-to-tr from-bimbo-700 to-bimbo-400 bg-clip-text text-transparent tracking-tight select-none drop-shadow">VR Hypno</span>
          </div>
          <nav class="flex space-x-2">
            <button 
              @click="navigateTo('player')"
              :class="[
                'btn',
                'rounded-full',
                'bg-bimbo-500',
                'text-white',
                currentView === 'player' ? 'ring-2 ring-bimbo-300 scale-105' : 'bg-bimbo-200 text-bimbo-700',
                'hover:bg-bimbo-600',
                'transition-all duration-150',
                'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
              ]"
            >
              Player
            </button>
            <button 
              @click="navigateTo('editor')"
              :class="[
                'btn',
                'rounded-full',
                'bg-bimbo-500',
                'text-white',
                currentView === 'editor' ? 'ring-2 ring-bimbo-300 scale-105' : 'bg-bimbo-200 text-bimbo-700',
                'hover:bg-bimbo-600',
                'transition-all duration-150',
                'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
              ]"
            >
              Editor
            </button>
          </nav>
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 flex flex-col justify-center items-center">
      <SessionList v-if="currentView === 'player'" />
      <Editor v-else />
    </main>
  </div>
</template>

<style>
/* Tout est géré par Tailwind */
</style>
