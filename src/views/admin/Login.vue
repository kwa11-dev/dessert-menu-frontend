<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { adminLogin } from "@/api/auth";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const { data } = await adminLogin({ email: email.value, password: password.value });

    // Save token (localStorage or Pinia store)
    localStorage.setItem("admin_token", data.token);

    toast.add({ severity: "success", summary: "Login Successful", life: 2000 });
    router.push("/admin"); // redirect to dashboard
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: error.response?.data?.message || "Invalid credentials",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="card p-6 w-96 shadow-lg rounded-xl bg-white">
      <h2 class="text-center text-2xl font-bold mb-5">Admin Login</h2>

      <div class="mb-4" style="margin-bottom: 1rem;">
        <label for="email" class="field">Email</label>
        <InputText id="email" v-model="email" class="w-full" style="min-height: 40px; border-radius: 10%; padding: 0.5rem; background:white;" type="email" placeholder="Enter email" />
      </div>

      <div class="mb-4" style="margin-bottom: 1rem;">
        <label for="password" class="field">Password</label>
        <Password id="password" v-model="password" class="w-full" style="min-height: 40px; border-radius: 10%; padding: 0.5rem;background:white;" :feedback="false" placeholder="Enter password" />
      </div>
      <div class="flex justify-center">
      <Button label="Login" :loading="loading" style="min-width: 100px;min-height: 40px; border-radius: 10%; padding: 0.5rem;background:#4BA8A7;" @click="handleLogin" />

      </div>
    </div>
  </div>
</template>

<style scoped>
.field{
    color: #053A39;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
}
</style>