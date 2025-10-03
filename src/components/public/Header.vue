<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Static assets
const wallpaper = new URL('@/assets/wallpaper.jpeg', import.meta.url).href;
const logo = new URL('@/assets/logo.png', import.meta.url).href;

// Title & subtitle
const title = "Pate Cream";
const subtitle = "Ice Cream And Desserts";

// Social links (fetched from API)
const socials = ref([
  { icon: "pi pi-facebook", url: "#" },
  { icon: "pi pi-instagram", url: "#" },
  { icon: "pi pi-whatsapp", url: "#" }
]);

// Fetch social URLs from API on mount
onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu-constants`);

    socials.value = [
      { icon: "pi pi-facebook", url: response.data.facebook_url || "#" },
      { icon: "pi pi-instagram", url: response.data.instagram_url || "#" },
      { icon: "pi pi-whatsapp", url: response.data.whatsapp_url || "#" }
    ];
  } catch (error) {
    console.error("Failed to fetch social URLs:", error);
  }
});
</script>

<template>
  <div class="header">
    <!-- Wallpaper -->
    <div 
      class="wallpaper"
      :style="{ backgroundImage: `url(${wallpaper})` }"
    ></div>

    <!-- Logo overlapping wallpaper -->
    <div class="logo-container">
      <img :src="logo" alt="Logo" class="logo" />
    </div>

    <!-- Title and Subtitle -->
    <div class="flex justify-center mt-4">
      <div class="flex flex-col gap-2">
        <h1 class="title m-0">{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Social Icons -->
    <div class="socials flex justify-center mt-4 gap-4">
      <a 
        v-for="(social, index) in socials" 
        :key="index" 
        :href="social.url" 
        target="_blank" 
        rel="noopener"
        class="icon-link"
      >
        <i :class="social.icon"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: relative;
  text-align: center;
}

.wallpaper {
  width: 100%;
  height: 250px;
  background-size: cover;
  background-position: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-top: -80px;
}

.logo {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 5px solid white;
  background: white;
  object-fit: cover;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #751335;
  margin: 0;
  margin-bottom: 0.3rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #444;
  margin: 0;
  margin-bottom: 1rem;
}

.icon-link {
  font-size: 1.5rem;
  color: #333;
  transition: color 0.2s ease;
}

.icon-link:hover {
  color: #7a1c34;
}

.socials {
  gap: 1rem;
}
</style>
