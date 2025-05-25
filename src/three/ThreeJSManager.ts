/// <reference types="three" />
import * as THREE from 'three'

interface ThreeJSManagerOptions {
  canvas: HTMLCanvasElement
  playlist: any
  sessions: any[]
  songs: any[]
  vr?: boolean
}

export default class ThreeJSManager {
  private canvas: HTMLCanvasElement
  private playlist: any
  private sessions: any[]
  private songs: any[]
  private vr: boolean
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private animationId: number | null = null

  constructor(options: ThreeJSManagerOptions) {
    this.canvas = options.canvas
    this.playlist = options.playlist
    this.sessions = options.sessions
    this.songs = options.songs
    this.vr = !!options.vr
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas })
    this.renderer.setClearColor(0x111111)
    this.resize()
    if (this.vr) {
      this.renderer.xr.enabled = true
      // Optionally: navigator.xr.requestSession('immersive-vr')
    }
  }

  resize() {
    const width = this.canvas.clientWidth || 800
    const height = this.canvas.clientHeight || 600
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  init() {
    // Basic scene setup
    this.camera.position.set(0, 1.6, 3)
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    // TODO: Add gaze button mesh, session logic, etc.
    this.animate()
  }

  animate = () => {
    this.animationId = requestAnimationFrame(this.animate)
    // TODO: Gaze button logic, session playback, etc.
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId)
    // No need to remove canvas, Vue manages it
    // TODO: Dispose Three.js objects, listeners, etc.
  }
} 