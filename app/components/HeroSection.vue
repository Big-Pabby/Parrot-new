<script setup lang="ts">
const { observeElements } = useScrollAnimation()

onMounted(() => {
  observeElements('.scroll-animate', 'animate-fade-in-up')
})
</script>

<template>
   <section class="bg-cream pt-16 pb-0 overflow-hidden">
     <div class="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-20">
       <div class="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 md:gap-12">
         <!-- Left Content -->
         <div class="flex flex-col gap-6 md:gap-8 w-full lg:w-6/12">
           <div class="flex flex-col gap-4 md:gap-6">
             <h1 class="font-heading text-4xl md:text-5xl  font-bold leading-[1.1] text-black scroll-animate">
               Everything you need to avoid bad buying decisions.
             </h1>
             <p class="font-body text-[#333333] text-base  md:text-lg leading-relaxed max-w-[540px] scroll-animate">
               A community of real Customers, Creators, and Pro Reviewers having honest conversations about their buying experiences — that businesses cannot delete.
             </p>
           </div>
           <a
             href="https://onelink.to/nwmnzy"
             class="inline-flex items-center gap-2 bg-parrot-lime border-2 border-black text-black font-body font-medium text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:brightness-90 transition-all self-start shadow-brutal-sm scroll-animate"
           >
             Download The Parrot App
           </a>
         </div>

        <!-- Right: Phone Mockup -->
        <div class="relative w-full md:w-5/12 lg:self-end mt-8 lg:mt-0 scroll-animate">
          <img
            src="/images/hero.png"
            alt="Parrot app showing customer reviews"
            class="w-full md:w-auto max-h-[400px] md:max-h-[500px] lg:max-h-[680px] object-contain relative z-10 mx-auto"
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
