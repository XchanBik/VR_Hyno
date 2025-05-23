<script setup lang="ts">
import { t } from '../i18n'
import { useAppStore } from '../store/app'
import flagGB from '@/assets/flag-gb.svg'
import flagFR from '@/assets/flag-fr.svg'

const appStore = useAppStore()
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-bimbo-400 via-bimbo-200 to-bimbo-400 shadow-md z-10 border-b border-bimbo-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bimbo-500 shadow-lg">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21s-6.5-4.35-9-7.5C-1.5 8.5 2.5 3.5 7 6.5c2.1 1.4 3 2.5 5 5 2-2.5 2.9-3.6 5-5C21.5 3.5 25.5 8.5 21 13.5c-2.5 3.15-9 7.5-9 7.5z" />
            </svg>
          </span>
          <button 
            @click="appStore.setView('player')"
            :class="[
              'btn',
              'rounded-full',
              'bg-bimbo-500',
              'text-white',
              appStore.currentView === 'player' ? 'ring-2 ring-bimbo-300 scale-105' : 'bg-bimbo-200 text-bimbo-700',
              'hover:bg-bimbo-600',
              'transition-all duration-150',
              'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
            ]"
          >
            {{ t('player') }}
          </button>
          <button 
            @click="appStore.setView('editor')"
            :class="[
              'btn',
              'rounded-full',
              'bg-bimbo-500',
              'text-white',
              appStore.currentView === 'editor' ? 'ring-2 ring-bimbo-300 scale-105' : 'bg-bimbo-200 text-bimbo-700',
              'hover:bg-bimbo-600',
              'transition-all duration-150',
              'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
            ]"
          >
            {{ t('editor') }}
          </button>
        </div>
        <div class="flex items-center space-x-2 ml-4">
          <button @click="appStore.setLocale('en')" :class="[appStore.locale === 'en' ? 'ring-2 ring-bimbo-400' : '', 'rounded-full p-1 transition']" title="English">
            <img :src="flagGB" alt="GB" class="w-7 h-5 rounded shadow-sm" />
          </button>
          <button @click="appStore.setLocale('fr')" :class="[appStore.locale === 'fr' ? 'ring-2 ring-bimbo-400' : '', 'rounded-full p-1 transition']" title="Français">
            <img :src="flagFR" alt="FR" class="w-7 h-5 rounded shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template> 