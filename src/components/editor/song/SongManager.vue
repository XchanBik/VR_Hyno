<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '@/i18n'

interface SongInfo {
  uid: string
  info: {
    name: string
    duration: number
    tags: string[]
  }
}

const songs = ref<SongInfo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadSongs() {
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getSongs?.()
    if (result?.success) {
      songs.value = result.songs || []
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function addSong() {
  // @ts-ignore
  const result = await window.electronAPI?.addSong?.()
  if (result?.success) {
    await loadSongs()
  }
}

onMounted(loadSongs)
</script>


<template>
</template>