<template>
  <footer class="bg-light py-4 mt-5 border-top">
    <div class="container text-center">
      <h5 class="title">📍 Our Location</h5>
      <div class="ratio ratio-16x9 rounded shadow">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3290.343490007131!2d35.86303757642366!3d34.44342757301223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1521f5ebb05c5f79%3A0x23688142bb41bdd9!2sPate%20Cream!5e0!3m2!1sen!2slb!4v1760731722747!5m2!1sen!2slb"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <p class="mt-3 text-muted">
        © {{ new Date().getFullYear() }} MerryCream. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
// No JS logic needed for now
</script>
<style scoped>
.title {
  color: #097877;
  font-size: 30px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}
</style>
