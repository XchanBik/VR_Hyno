import { defineStore } from 'pinia'
import { NavigationPath } from '@/navigationTree'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    path: ['player', 'playlist', 'list'] as NavigationPath,
    selectedUid: null as string | null,
  }),
  actions: {
    navigateTo(path: NavigationPath, uid?: string | null) {
      this.path = path
      this.selectedUid = uid ?? null
    }
  }
}) 