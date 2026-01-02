<script setup>
import Header from '@/components/public/Header.vue'
import MainMenu from '@/components/public/MainMenu.vue'
import MerryCream from '@/components/public/MerryCream.vue'
import Footer from '@/components/public/Footer.vue'
</script>

<template>
  <Header />
  <MainMenu />
  <MerryCream v-if="false" />
  <Footer />
</template>
