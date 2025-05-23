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
  <div class="container">
    <header>
      <h1>VR Hypno</h1>
      <nav>
        <button 
          :class="{ active: currentView === 'player' }"
          @click="navigateTo('player')"
        >
          Player
        </button>
        <button 
          :class="{ active: currentView === 'editor' }"
          @click="navigateTo('editor')"
        >
          Editor
        </button>
      </nav>
    </header>
    <main>
      <SessionList v-if="currentView === 'player'" /> <!-- Player view -->
      <Editor v-else /> <!-- Editor view -->        
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8f9fa;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  color: #2c3e50;
}

nav {
  display: flex;
  gap: 1rem;
}

nav button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

nav button:hover {
  background-color: #f0f0f0;
  color: #2c3e50;
}

nav button.active {
  background-color: #2c3e50;
  color: white;
}

main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}
</style>
