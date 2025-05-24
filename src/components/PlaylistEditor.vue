<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { t } from '../i18n'
import { useAppStore } from '../store/app'
import type { PlaylistInfo } from '../types/playlist'

const props = defineProps<{ uid: string }>()
const emit = defineEmits(['close'])

const loading = ref(true)
const error = ref<string | null>(null)
const info = ref<PlaylistInfo | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getPlaylist?.(props.uid)
    if (result?.success) {
      info.value = result.playlist
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.uid, load)
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 shadow-lg">
    <button @click="$emit('close')" class="absolute top-4 right-4 text-brand-400 hover:text-brand-600 text-2xl">&times;</button>
    <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else-if="info">
      <div class="mb-4">
        <div class="text-xs text-brand-400 mb-1">UID: <span class="font-mono">{{ props.uid }}</span></div>
        <label class="block mb-2 font-bold text-brand-700">{{ t('playlistName') }}
          <input v-model="info.name" class="rounded-full px-4 py-2 border border-brand-200 focus:ring-2 focus:ring-brand-400 outline-none w-full mt-1" />
        </label>
        <label class="flex items-center gap-2 mb-2">
          <input v-model="info.repeat" type="checkbox" class="accent-brand-500" />
          {{ t('repeat') }}
        </label>
      </div>
      <div class="mb-4">
        <div class="font-bold text-brand-700 mb-2">{{ t('sessions') }}</div>
        <ul class="space-y-1">
          <li v-for="(session, idx) in info.sessions" :key="session" class="flex items-center gap-2">
            <span class="bg-brand-200 rounded px-2 py-1 text-brand-700 text-xs">{{ session }}</span>
            <!-- TODO: drag & drop, remove, reorder -->
          </li>
        </ul>
        <!-- TODO: add session, reorder, etc. -->
      </div>
      <div class="flex gap-2 mt-4">
        <button class="btn rounded-full px-6 py-2 shadow bg-brand-500 text-white hover:bg-brand-600 transition font-bold tracking-wide uppercase">{{ t('save') }}</button>
        <button @click="$emit('close')" class="btn rounded-full px-6 py-2 shadow bg-brand-200 text-brand-700 hover:bg-brand-300 transition font-bold tracking-wide uppercase">{{ t('cancel') }}</button>
      </div>
    </div>
  </div>
</template> 