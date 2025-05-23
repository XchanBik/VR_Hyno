<script setup lang="ts">
import { ref, onMounted } from 'vue'

const files = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadFiles = async () => {
  try {
    loading.value = true
    error.value = null
    const result = await window.electronAPI.getFiles()
    if (result.success) {
      files.value = result.files || []
    } else {
      error.value = result.error || 'Unknown error occurred'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load files'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFiles()
})
</script>

<template>
  <div class="container">
    <h1>VR Hypno - File Manager</h1>
    <div class="file-list">
      <h2>Files in data directory:</h2>
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="files.length === 0" class="empty">No files found in data directory</div>
      <ul v-else>
        <li v-for="file in files" :key="file">{{ file }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.file-list {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.empty {
  color: #666;
  font-style: italic;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}
</style>
