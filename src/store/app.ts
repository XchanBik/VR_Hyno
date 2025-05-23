import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedPlaylistUid: null as string | null,
    selectedSessionUid: null as string | null,
    locale: 'en' as 'en' | 'fr',
    currentView: 'player' as 'player' | 'editor',
  }),
  actions: {
    setPlaylist(uid: string | null) {
      this.selectedPlaylistUid = uid
    },
    setSession(uid: string | null) {
      this.selectedSessionUid = uid
    },
    setLocale(locale: 'en' | 'fr') {
      this.locale = locale
    },
    setView(view: 'player' | 'editor') {
      this.currentView = view
    },
  },
  persist: true,
})