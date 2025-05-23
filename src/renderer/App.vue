<template>
  <div class="container">
    <h1>VR Hypno POC</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="content">
      <h2>Test File Content:</h2>
      <pre>{{ JSON.stringify(fileContent, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ipcRenderer } from 'electron'

const loading = ref(true)
const error = ref<string | null>(null)
const fileContent = ref<any>(null)

onMounted(async () => {
  try {
    fileContent.value = await ipcRenderer.invoke('read-test-file')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
  } finally {
    loading.value = false
  }
})
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

pre {
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.error {
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
}
</style> 