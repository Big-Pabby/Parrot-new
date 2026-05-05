import { ref } from 'vue'

export const navbarVisible = ref(true)

export function useNavbar() {
  const hideNavbar = () => {
    navbarVisible.value = false
  }

  const showNavbar = () => {
    navbarVisible.value = true
  }

  const toggleNavbar = () => {
    navbarVisible.value = !navbarVisible.value
  }

  return {
    navbarVisible,
    hideNavbar,
    showNavbar,
    toggleNavbar
  }
}