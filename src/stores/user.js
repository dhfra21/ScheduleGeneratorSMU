import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);

  // Initialize state from localStorage
  const initializeState = () => {
    isLoggedIn.value = localStorage.getItem('isUserLoggedIn') === 'true';
  };

  // Login action
  const login = () => {
    isLoggedIn.value = true;
    localStorage.setItem('isUserLoggedIn', 'true');
  };

  // Logout action
  const logout = () => {
    isLoggedIn.value = false;
    localStorage.removeItem('isUserLoggedIn');
  };

  // Check if user is logged in
  const checkAuth = () => {
    return isLoggedIn.value;
  };

  return {
    isLoggedIn,
    initializeState,
    login,
    logout,
    checkAuth
  };
}, {
  persist: true // This will persist the store in localStorage
}); 