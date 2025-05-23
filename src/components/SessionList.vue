<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Session } from '../types/session'

const sessions = ref<Session[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadSessions = async () => {
  try {
    loading.value = true
    error.value = null
    const result = await window.electronAPI.getSessions()
    if (result.success) {
      sessions.value = result.sessions || []
    } else {
      error.value = result.error || 'Unknown error occurred'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load sessions'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSessions()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-bimbo-700 flex items-center gap-2">
        <svg class="w-7 h-7 text-bimbo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" /><path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        Sessions
      </h2>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bimbo-500 mx-auto"></div>
      <p class="mt-4 text-bimbo-600">Loading sessions...</p>
    </div>

    <div v-else-if="error" class="bg-bimbo-50 border border-bimbo-200 rounded-lg p-4">
      <p class="text-bimbo-700">{{ error }}</p>
    </div>

    <div v-else-if="sessions.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="bg-bimbo-100 rounded-full p-6 mb-4 shadow-sm">
        <svg class="w-12 h-12 text-bimbo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" /><path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
      <p class="text-bimbo-700 text-lg font-semibold mb-2">No sessions found</p>
      <p class="text-bimbo-500 mb-6">You don't have any sessions yet. Start by creating a new one!</p>
      <button class="btn rounded-full px-6 py-2 shadow bg-bimbo-500 text-white hover:bg-bimbo-600 transition font-bold tracking-wide uppercase">Create Session</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="session in sessions" :key="session.folder" class="card group hover:shadow-lg transition-shadow duration-200">
        <div v-if="session.info.thumbnail" class="aspect-video bg-bimbo-50 overflow-hidden">
          <img 
            :src="session.info.thumbnail" 
            :alt="session.info.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          >
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-bimbo-800 mb-2">{{ session.info.name }}</h3>
          <p v-if="session.info.description" class="text-bimbo-600 text-sm mb-4">
            {{ session.info.description }}
          </p>
          <div class="flex justify-between items-center text-sm text-bimbo-500 mb-3">
            <span v-if="session.info.duration" class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ session.info.duration }} min
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ new Date(session.info.created).toLocaleDateString() }}
            </span>
          </div>
          <div v-if="session.info.tags?.length" class="flex flex-wrap gap-2">
            <span 
              v-for="tag in session.info.tags" 
              :key="tag"
              class="px-2 py-1 bg-bimbo-50 text-bimbo-700 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-list {
  padding: 1rem;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border-radius: 4px;
  padding: 1rem;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.session-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-thumbnail {
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.session-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.session-info {
  padding: 1rem;
}

.session-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style> 