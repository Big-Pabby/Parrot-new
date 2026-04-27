<script setup lang="ts">
const { observeElements } = useScrollAnimation()

onMounted(() => {
  observeElements('.scroll-animate', 'animate-fade-in-up')
})
</script>

<template>
  <section class="bg-cream pt-8 pb-0 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[700px]">
        <!-- Left Content -->
        <div class="flex flex-col gap-8 md:w-6/12">
          <div class="flex flex-col gap-6">
            <h1 class="font-heading text-[56px] lg:text-[64px] font-bold leading-[1.1] text-black scroll-animate">
              Everything you need to avoid bad buying decisions.
            </h1>
            <p class="font-body text-[#333333] text-xl leading-relaxed max-w-[540px] scroll-animate">
              A community of real Customers, Creators, and Pro Reviewers having honest conversations about their buying experiences — that businesses cannot delete.
            </p>
          </div>
          <a
            href="https://onelink.to/nwmnzy"
            class="inline-flex items-center gap-2 bg-parrot-lime border-2 border-black text-black font-body font-medium text-lg px-8 py-3 rounded-lg hover:brightness-90 transition-all self-start shadow-brutal-sm scroll-animate"
          >
            Download The Parrot App
          </a>
        </div>

        <!-- Right: Phone Mockup -->
        <div class="relative md:w-5/12 lg:self-end scroll-animate">
          <img
            src="/images/hero.png"
            alt="Parrot app showing customer reviews"
            class="w-auto max-h-[680px] object-contain relative z-10"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
h1.scroll-animate.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
p.scroll-animate.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: 0.2s;
}
a.scroll-animate.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: 0.4s;
}
div.scroll-animate.animate-fade-in-up {
  animation: fadeInRight 0.6s ease-out forwards;
}
</style>
