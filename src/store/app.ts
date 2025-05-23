import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedPlaylistUid: null as string | null,
    selectedSessionUid: null as string | null,
    locale: 'en' as 'en' | 'fr',
    currentView: 'player' as 'player' | 'editor',
    playerView: 'list' as 'list' | 'edit' | 'play',
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
    setPlayerView(view: 'list' | 'edit' | 'play', playlistUid: string | null = null) {
      this.playerView = view
      this.selectedPlaylistUid = playlistUid
    },
  },
  persist: true,
})