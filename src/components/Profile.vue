<template>
    <v-container v-if="isUserLoggedIn" fluid class="user-container">
      <v-main class="user-content">
        <v-container fluid>
          <v-card class="pa-6 elevation-2" max-width="600" style="margin: auto;">
            <v-card-title class="text-h5 font-weight-bold mb-4" style="color: #1e293b;">
              User Profile
            </v-card-title>
  
            <v-card-text>
              <v-form @submit.prevent="saveChanges">
                <!-- Profile Picture -->
                <v-row class="mb-4 justify-center">
                  <v-avatar size="120">
                    <v-img 
                      :src="profilePicture || 'https://via.placeholder.com/120'" 
                      alt="Profile Picture"
                    ></v-img>
                  </v-avatar>
                </v-row>
                
                <v-row class="justify-center mb-4">
                  <v-btn 
                    color="primary" 
                    small 
                    @click="$refs.profileInput.click()"
                  >
                    Change Picture
                  </v-btn>
                  <input
                    ref="profileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="onFileChange"
                  >
                </v-row>
  
                <!-- Name Field -->
                <v-text-field
                  v-model="userData.name"
                  label="Name"
                  prepend-icon="mdi-account"
                  outlined
                  class="mb-4"
                ></v-text-field>
  
                <!-- Email Field -->
                <v-text-field
                  v-model="userData.email"
                  label="Email"
                  prepend-icon="mdi-email"
                  type="email"
                  outlined
                  class="mb-4"
                ></v-text-field>
  
                <!-- Password Field -->
                <v-text-field
                  v-model="userData.password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  outlined
                  class="mb-4"
                ></v-text-field>
  
                <!-- Action Buttons -->
                <v-row class="mt-4">
                  <v-col>
                    <v-btn
                      color="primary"
                      type="submit"
                      large
                      :disabled="!hasChanges"
                    >
                      Save Changes
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      color="error"
                      @click="logout"
                      large
                      outlined
                    >
                      Logout
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </v-container>
  
    <!-- Access Denied -->
    <v-container v-else class="fill-height d-flex align-center justify-center">
      <v-card class="pa-4 elevation-2">
        <v-card-text>
          <h2 class="text-h5">Access Denied</h2>
          <p>Please log in to access this page.</p>
          <v-btn color="primary" @click="router.push('/user-login')">
            Go to Login
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  const isUserLoggedIn = ref(localStorage.getItem("isUserLoggedIn") === "true");
  
  // User data
  const initialData = {
    name: "mourad",
    email: "jmourad.kochkar@gmail.com",
    password: "",
  };
  const userData = ref({ ...initialData });
  const profilePicture = ref(null);
  const showPassword = ref(false);
  
  // Track changes
  const hasChanges = computed(() => {
    return (
      JSON.stringify(userData.value) !== JSON.stringify(initialData) ||
      profilePicture.value !== null
    );
  });
  
  onMounted(() => {
    if (!isUserLoggedIn.value) {
      router.push("/user-login");
    }
  });
  
  const logout = () => {
    localStorage.removeItem("isUserLoggedIn");
    router.push("/user-login");
  };
  
  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePicture.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveChanges = () => {
    console.log("Saving changes:", userData.value, profilePicture.value);
    
    // Update initial data after successful save
    Object.assign(initialData, userData.value);
    
    
    userData.value.password = "";
    
    alert("Profile updated successfully!");
  };
  </script>
  
  <style scoped>
  .user-container {
    display: flex;
    height: 100vh;
  }
  
  .user-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  </style>
