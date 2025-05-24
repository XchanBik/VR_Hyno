<script setup lang="ts">
import { ref } from 'vue'
const collapsed = ref(false)
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- HEADER SECTION -->
    <div class="w-full h-20 flex-shrink-0" style="background: #ff4dd2;">
      <div class="h-full flex items-center justify-center">
        <!-- COMPOSANT FUTUR HEADER -->
        <div class="text-white text-2xl font-bold">HEADER COMPONENT</div>
      </div>
    </div>

    <!-- CONTENT GRID -->
    <div class="flex-1 flex min-h-0">
      <!-- LEFT SIDEBAR -->
      <div
        :class="[
          'flex-shrink-0 transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        ]"
        style="background: #ffe066;"
      >
        <div class="h-full flex flex-col">
          <!-- Toggle Button -->
          <div class="p-4 flex justify-center">
            <button 
              @click="collapsed = !collapsed" 
              class="bg-black text-yellow-300 rounded px-3 py-2 font-bold hover:bg-gray-800 transition-colors"
            >
              {{ collapsed ? '→' : '←' }}
            </button>
          </div>
          
          <!-- COMPOSANT NAVIGATION -->
          <div class="flex-1 p-4">
            <div v-if="!collapsed" class="text-black font-bold text-lg">
              NAVIGATION COMPONENT
            </div>
            <div v-else class="text-black font-bold text-center">
              NAV
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT CONTENT -->
      <div class="flex-1 min-w-0" style="background: #51e898;">
        <div class="h-full w-full p-6">
          <!-- COMPOSANT ROUTER VIEW -->
          <div class="text-white text-3xl font-bold mb-4">
            ROUTER VIEW COMPONENT
          </div>
          <div class="text-white text-lg">
            Contenu principal qui prend toute la hauteur disponible
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Design 100% Tailwind, pas de CSS custom nécessaire */
</style>