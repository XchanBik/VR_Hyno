import { defineStore } from 'pinia'
import { NavigationPath } from '@/navigationTree'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    path: ['player', 'playlist', 'list'] as NavigationPath,
    selectedUid: null as string | null,
  }),
  actions: {
    navigateTo(path: readonly string[], uid?: string | null) {
      this.path = [...path] as NavigationPath
      this.selectedUid = uid ?? null
    }
  }
}) 