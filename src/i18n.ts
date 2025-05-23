import { ref, computed } from 'vue'

export const locale = ref<'en' | 'fr'>('en')

const messages = {
  en: {
    appTitle: 'VR Hypno',
    player: 'Player',
    editor: 'Editor',
    playlists: 'Playlists',
    addPlaylist: 'Add Playlist',
    createPlaylist: 'Create Playlist',
    playlistName: 'Playlist name',
    repeat: 'Repeat',
    noPlaylists: 'No playlists yet. Click + to create one!',
    loading: 'Loading playlists...',
    unknownError: 'Unknown error',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
  },
  fr: {
    appTitle: 'VR Hypno',
    player: 'Lecteur',
    editor: 'Éditeur',
    playlists: 'Playlists',
    addPlaylist: 'Ajouter une playlist',
    createPlaylist: 'Créer une playlist',
    playlistName: 'Nom de la playlist',
    repeat: 'Répéter',
    noPlaylists: 'Aucune playlist pour l’instant. Cliquez sur + pour en créer une !',
    loading: 'Chargement des playlists...',
    unknownError: 'Erreur inconnue',
    cancel: 'Annuler',
    yes: 'Oui',
    no: 'Non',
  }
}

export function t(key: keyof typeof messages['en']) {
  return computed(() => messages[locale.value][key]).value
} 