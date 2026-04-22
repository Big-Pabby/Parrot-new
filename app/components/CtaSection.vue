<script setup lang="ts">
const { observeElements } = useScrollAnimation()

onMounted(() => {
  observeElements('.scroll-animate', 'animate-fade-in-up')
})
</script>

<template>
  <section class="bg-lavender py-20 lg:py-28 relative overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20 relative">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        <!-- Left Content -->
        <div class="flex flex-col gap-8 max-w-[600px] flex-1 z-10">
          <h2 class="font-heading text-4xl lg:text-[56px] font-bold leading-tight text-black scroll-animate">
            Stop Making Buying Decisions Based on Guesses. Join Parrot Now
          </h2>
          <p class="font-body text-black text-xl leading-relaxed max-w-[560px] scroll-animate animate-fade-in-up-delay">
            Every answer you need before you spend is already on Parrot. Written by real customers, posted by honest creators, and backed by verified business profiles. Join the community that shops smarter.
          </p>
          <a
            href="#"
            class="inline-flex items-center bg-parrot-lime border-2 border-black text-black font-body font-medium text-lg px-8 py-3 rounded-lg hover:brightness-90 transition-all self-start shadow-brutal-sm scroll-animate animate-fade-in-up-delay-2"
          >
            Download The Parrot App
          </a>
        </div>

        <!-- Right: Woman Image -->
        <div class="lg:absolute lg:right-0 lg:bottom-0 flex-shrink-0 lg:h-full flex items-end justify-end pointer-events-none">
          <!-- Decorative circle behind image -->
          <div class="absolute right-10 bottom-0 w-72 h-72 bg-white/30 rounded-full blur-md hidden lg:block" />
          <img
            src="/images/cta-woman.png"
            alt="Happy Parrot user"
            class="relative z-10 max-h-[520px] w-auto object-contain grayscale contrast-110"
            style="filter: grayscale(100%) contrast(1.1);"
          />
        </div>
      </div>
    </div>
  </section>
</template>
