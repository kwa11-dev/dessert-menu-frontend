<template>
  <div class="relative w-full min-h-screen bg-gradient-to-b from-pink-50 to-blue-50">
    <!-- Title -->
    <h1 class="title">
      Merry Cream
    </h1>

    <!-- Image Container with Overlay -->
    <div class="relative w-full max-w-4xl mx-auto h-[60vh] overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
      <!-- Background Image with Strong Blur -->
      <img
        src="@/assets/wallpaper.jpeg" 
        alt="Merry Cream Wallpaper"
        class="absolute inset-0 w-full h-full object-cover"
        style="filter: blur(8px); transform: scale(1.1);"
      />
      
      <!-- Dark Overlay for better text contrast -->
      <div class="absolute inset-0 bg-black/40"></div>
      
      <!-- Content Overlay - Centered -->
      <div class="absolute inset-0 flex items-center justify-center text-white px-6">
        <div class="bg-white/10 backdrop-blur-md rounded-3xl px-12 py-10 shadow-xl">
          <h2 class="first-subtitle">
            Today's Selection
          </h2>
          
          <div v-if="loading" class="text-2xl text-center animate-pulse">
            Loading flavors...
          </div>
          
          <div v-else class="text-center">
            <p class="flavor">
              {{ firstFlavor }}
            </p>
            <p class="first-subtitle">
              &
            </p>
            <p class="flavor">
              {{ secondFlavor }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="text-center mt-8 text-gray-600">
      <p class="text-xl">🍦 Fresh & Delicious 🍦</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const firstFlavor = ref('');
const secondFlavor = ref('');
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu-constants`);
    firstFlavor.value = response.data.merry_cream_first_flavor;
    secondFlavor.value = response.data.merry_cream_second_flavor;
  } catch (error) {
    console.error('Failed to fetch flavors:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.title{
    color:#097877;
    font-size: 30px;
    font-weight: bold;
    display: flex;
    justify-content: center;
}
.first-subtitle{
    color:#053A39;
    font-size: 30px;
    font-weight: bold;
    display: flex;
    justify-content: center;
}
.flavor{
    color:#FFF1FB;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    justify-content: center;
}
</style>