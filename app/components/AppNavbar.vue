<script setup lang="ts">
const isMenuOpen = ref(false)
const route = useRoute()

const navLinks = computed(() => [
  { label: 'Home', href: '/', active: route.path === '/' },
  { label: 'About Us', href: '/about', active: false },
  { label: 'How It Works', href: '/how-it-works', active: route.path === '/how-it-works' },
  { label: 'Contact', href: '#contact', active: false },
])
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 md:mx-20 md:my-6 bg-lavender border border-black md:rounded-[12px] md:shadow-brutal">
    <div class="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
      <!-- Logo -->
       <nuxt-link to="/"> <img src="/images/parrot-logo.svg" alt="Parrot" class=" w-auto" /></nuxt-link>
     

      <!-- Desktop Nav Links -->
      <div class="hidden lg:flex items-center gap-10">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          :class="[
            'font-body text-black text-lg hover:opacity-60 transition-opacity',
            link.active ? 'underline underline-offset-4' : '',
          ]"
        >{{ link.label }}</a>
      </div>

      <!-- CTA Button -->
      <a
        href="https://onelink.to/nwmnzy"
        class="hidden lg:block bg-parrot-amber border-2 border-black text-black font-body text-base font-medium px-7 py-2.5 rounded-lg hover:brightness-95 transition-all"
      >
        Sign Up On Parrot
      </a>

      <!-- Mobile Toggle -->
      <button class="lg:hidden p-2" aria-label="Toggle menu" @click="isMenuOpen = !isMenuOpen">
        <svg class="w-6 h-6" fill="none" stroke="#03045e" viewBox="0 0 24 24">
          <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="isMenuOpen" class="lg:hidden border-t border-black bg-cream px-8 py-6 flex flex-col gap-5">
        <a v-for="link in navLinks" :key="link.label" :href="link.href" class="font-body text-black text-lg">
          {{ link.label }}
        </a>
        <a href="https://onelink.to/nwmnzy" class="self-start bg-parrot-amber border-2 border-black text-black font-body px-6 py-2 rounded-lg">
          Sign Up On Parrot
        </a>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
