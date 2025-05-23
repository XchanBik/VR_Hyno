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
  <div class="session-list">
    <h2>Sessions</h2>
    <div v-if="loading" class="loading">Loading sessions...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="sessions.length === 0" class="empty">No sessions found</div>
    <div v-else class="sessions-grid">
      <div v-for="session in sessions" :key="session.folder" class="session-card">
        <div class="session-thumbnail" v-if="session.info.thumbnail">
          <img :src="session.info.thumbnail" :alt="session.info.name">
        </div>
        <div class="session-info">
          <h3>{{ session.info.name }}</h3>
          <p v-if="session.info.description" class="description">{{ session.info.description }}</p>
          <div class="session-meta">
            <span class="duration" v-if="session.info.duration">{{ session.info.duration }} min</span>
            <span class="created">{{ new Date(session.info.created).toLocaleDateString() }}</span>
          </div>
          <div class="tags" v-if="session.info.tags?.length">
            <span v-for="tag in session.info.tags" :key="tag" class="tag">{{ tag }}</span>
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