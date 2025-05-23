import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useMeditationStore = defineStore('meditation', () => {
  const currentAudio = ref(null)
  const currentConfig = ref(null)
  const hasUnsavedChanges = ref(false)
  const sessions = ref([])
  const currentSession = ref(null)
  const rootDirHandle = ref(null)

  // Get base path for songs directory - always relative to index.html
  const getSongsPath = () => {
    return './songs'
  }

  // Initialize root directory
  const initRootDirectory = async () => {
    try {
      // Request permission to access the songs directory
      const dirHandle = await window.showDirectoryPicker({
        startIn: 'documents',
        id: 'meditation-sessions',
        mode: 'readwrite'
      })

      // Verify we have write access by creating and removing a test file
      const testFile = await dirHandle.getFileHandle('test.txt', { create: true })
      await dirHandle.removeEntry('test.txt')

      rootDirHandle.value = dirHandle
      return dirHandle
    } catch (error) {
      console.error('Error initializing root directory:', error)
      throw error
    }
  }

  // Create a new session
  const createNewSession = async (sessionName) => {
    try {
      if (!rootDirHandle.value) {
        throw new Error('Root directory not initialized')
      }

      const sessionId = uuidv4()
      const sessionDirHandle = await rootDirHandle.value.getDirectoryHandle(sessionId, { create: true })
      
      const config = {
        name: sessionName,
        version: "1.0",
        author: "VR Meditation App",
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        duration: 0,
        tags: [],
        description: "",
        difficulty: "beginner",
        category: "general",
        audio: null
      }

      // Create config.json file
      const configFileHandle = await sessionDirHandle.getFileHandle('config.json', { create: true })
      const writable = await configFileHandle.createWritable()
      await writable.write(JSON.stringify(config, null, 2))
      await writable.close()

      const session = {
        id: sessionId,
        name: sessionName,
        config
      }

      sessions.value.push(session)
      currentSession.value = session
      currentConfig.value = config
      return session
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  // Load available sessions
  const loadSessions = async () => {
    try {
      if (!rootDirHandle.value) {
        throw new Error('Root directory not initialized')
      }

      const sessionsList = []
      for await (const entry of rootDirHandle.value.values()) {
        if (entry.kind === 'directory') {
          try {
            const configFileHandle = await entry.getFileHandle('config.json')
            const configFile = await configFileHandle.getFile()
            const config = JSON.parse(await configFile.text())
            
            sessionsList.push({
              id: entry.name,
              name: config.name,
              config
            })
          } catch (error) {
            console.error(`Error loading config for ${entry.name}:`, error)
          }
        }
      }

      sessions.value = sessionsList
      return sessions.value
    } catch (error) {
      console.error('Error loading sessions:', error)
      sessions.value = []
      return []
    }
  }

  // Load a specific session
  const loadSession = async (sessionId) => {
    try {
      if (!rootDirHandle.value) {
        throw new Error('Root directory not initialized')
      }

      const sessionDirHandle = await rootDirHandle.value.getDirectoryHandle(sessionId)
      const configFileHandle = await sessionDirHandle.getFileHandle('config.json')
      const configFile = await configFileHandle.getFile()
      const config = JSON.parse(await configFile.text())

      const session = {
        id: sessionId,
        name: config.name,
        config
      }

      currentSession.value = session
      currentConfig.value = config
      return session
    } catch (error) {
      console.error('Error loading session:', error)
      throw error
    }
  }

  // Upload audio file to a session
  const uploadAudio = async (sessionId, file) => {
    try {
      if (!rootDirHandle.value) {
        throw new Error('Root directory not initialized')
      }

      const sessionDirHandle = await rootDirHandle.value.getDirectoryHandle(sessionId)
      const audioFileHandle = await sessionDirHandle.getFileHandle(file.name, { create: true })
      const writable = await audioFileHandle.createWritable()
      await writable.write(await file.arrayBuffer())
      await writable.close()

      // Update config with audio info
      const configFileHandle = await sessionDirHandle.getFileHandle('config.json')
      const configFile = await configFileHandle.getFile()
      const config = JSON.parse(await configFile.text())
      
      config.audio = {
        filename: file.name,
        duration: 0, // You'll need to get this from the audio file
        size: file.size,
        type: file.type
      }
      config.lastModified = new Date().toISOString()

      // Save updated config
      const writableConfig = await configFileHandle.createWritable()
      await writableConfig.write(JSON.stringify(config, null, 2))
      await writableConfig.close()

      // Update store state
      currentConfig.value = config
      if (currentSession.value?.id === sessionId) {
        currentSession.value.config = config
      }

      return config
    } catch (error) {
      console.error('Error uploading audio:', error)
      throw error
    }
  }

  // Get audio URL for a session
  const getAudioUrl = async (sessionId, fileName) => {
    try {
      if (!rootDirHandle.value) {
        throw new Error('Root directory not initialized')
      }

      const sessionDirHandle = await rootDirHandle.value.getDirectoryHandle(sessionId)
      const audioFileHandle = await sessionDirHandle.getFileHandle(fileName)
      const file = await audioFileHandle.getFile()
      return URL.createObjectURL(file)
    } catch (error) {
      console.error('Error getting audio URL:', error)
      throw error
    }
  }

  // Set current session
  const setCurrentSession = (session) => {
    currentSession.value = session
    if (session) {
      currentConfig.value = session.config
    } else {
      currentConfig.value = null
    }
  }

  // Update unsaved changes state
  const setHasChanges = (value) => {
    hasUnsavedChanges.value = value
  }

  // Check if there are unsaved changes
  const hasChanges = computed(() => hasUnsavedChanges.value)

  return {
    currentAudio,
    currentConfig,
    currentSession,
    hasUnsavedChanges,
    sessions,
    rootDirHandle,
    initRootDirectory,
    createNewSession,
    loadSessions,
    loadSession,
    uploadAudio,
    getAudioUrl,
    setCurrentSession,
    setHasChanges,
    hasChanges
  }
}) 