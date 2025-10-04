<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Pate Cream - Menu'
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

#app {
  background-color: #fff1fb;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}
</style>
