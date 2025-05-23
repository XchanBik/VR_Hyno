import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'  // Import Tailwind CSS

// Import routes
import Editor from './components/editor/Editor.vue'
import Player from './components/player/Player.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/player' },
    { path: '/editor', component: Editor },
    { path: '/player', component: Player }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app') 