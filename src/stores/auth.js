import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const loading = ref(false);
  const error = ref(null);

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const userRole = computed(() => user.value?.role);

  // Initialize auth state
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      const userData = response.data;
      
      // Store user data
      user.value = userData;
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please try again.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Logout action
  const logout = () => {
    user.value = null;
    localStorage.removeItem('auth_user');
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    return user.value?.role === requiredRole;
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    userRole,
    initializeAuth,
    login,
    logout,
    hasRole,
    clearError
  };
}, {
  persist: {
    paths: ['user']
  }
}); 