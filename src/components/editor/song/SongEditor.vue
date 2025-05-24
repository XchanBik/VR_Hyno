<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import type { SongInfo } from '@/types/song'
import { nav, NavigationPath } from '@/navigationTree'

const navStore = useNavigationStore()
const uid = computed(() => navStore.options.uid as string)

const loading = ref(true)
const error = ref<string | null>(null)
const info = ref<SongInfo | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)

async function load() {
  if (!uid.value) return
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getSong?.(uid.value)
    if (result?.success) {
      info.value = result.song
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!info.value || !uid.value) return
  saving.value = true
  saveError.value = null
  try {
    const payload = {
      uid: uid.value,
      info: JSON.parse(JSON.stringify(info.value))
    }
    const result = await window.electronAPI?.updatePlaylist?.(payload)
    // @ts-ignore
    if (result?.success) {
      navStore.navigateTo(nav.player.playlist.list as NavigationPath)
    } else {
      saveError.value = result?.error || t('unknownError')
    }
  } catch (e) {
    saveError.value = (e as Error).message
  } finally {
    saving.value = false
  }
}

onMounted(load)
watch(uid, load)
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 pt-16 shadow-lg relative">
    <div class="absolute top-4 right-4 text-xs text-brand-300 font-mono opacity-70 select-all z-10">
      UID: {{ uid }}
    </div>
    <button @click="navStore.navigateTo(nav.editor.songs.list as NavigationPath)" class="absolute top-4 left-4 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('back') }}
    </button>
    <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else-if="info">
      <div class="mb-4">
        <label class="block mb-2 font-bold text-brand-700">{{ t('songName') }}
          <input v-model="info.name" class="rounded-full px-4 py-2 border border-brand-200 focus:ring-2 focus:ring-brand-400 outline-none w-full mt-1" />
        </label>
      </div>
      <div class="mb-4">
        <div class="font-bold text-brand-700 mb-2">{{ t('tags') }}</div>
        <ul class="space-y-1">
          <li v-for="(tag, idx) in info.tags" class="flex items-center gap-2">
            <span class="bg-brand-200 rounded px-2 py-1 text-brand-700 text-xs">{{ tag }}</span>
            <!-- TODO: drag & drop, remove, reorder -->
          </li>
        </ul>
        <!-- TODO: add session, reorder, etc. -->
      </div>
      <div v-if="saveError" class="text-center text-red-500 mb-2">{{ saveError }}</div>
      <div class="flex gap-2 mt-4">
        <button @click="save" :disabled="saving" class="btn rounded-full px-6 py-2 shadow bg-brand-500 text-white hover:bg-brand-600 transition font-bold tracking-wide uppercase">{{ t('save') }}</button>
        <button @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)" class="btn rounded-full px-6 py-2 shadow bg-brand-200 text-brand-700 hover:bg-brand-300 transition font-bold tracking-wide uppercase">{{ t('cancel') }}</button>
      </div>
    </div>
  </div>
</template> 