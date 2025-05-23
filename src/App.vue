<script setup lang="ts">
import SessionList from './components/SessionList.vue'
</script>

<template>
  <div class="container">
    <header>
      <h1>VR Hypno</h1>
    </header>
    <main>
      <SessionList />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8f9fa;
}

.container {
  min-height: 100vh;
}

header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  color: #2c3e50;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
