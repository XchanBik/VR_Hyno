<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FileContent } from './types/electron'

const files = ref<string[]>([])
const fileContent = ref<FileContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const loadFiles = async () => {
  try {
    loading.value = true
    error.value = null
    const result = await window.electronAPI.getFiles()
    if (result.success) {
      files.value = result.files || []
      // If we have test.json, load its content
      if (files.value.includes('test.json')) {
        const contentResult = await window.electronAPI.getFileContent('test.json')
        fileContent.value = contentResult.success && contentResult.content ? contentResult.content : null
      }
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
      <div v-else>
        <ul>
          <li v-for="file in files" :key="file">{{ file }}</li>
        </ul>
        
        <div v-if="fileContent" class="json-content">
          <h3>test.json content:</h3>
          <pre>{{ JSON.stringify(fileContent, null, 2) }}</pre>
        </div>
      </div>
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

.json-content {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
