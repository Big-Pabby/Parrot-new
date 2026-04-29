<template>
  <section class="relative pt-6 md:pt-8 w-full bg-none" style="height: 100px;">
    <!-- Orange tape: tilted down -->
    <div
      class="absolute left-[-1%] right-[-1%] bg-parrot-tape1 border-y-2 border-black"
      style="top: 20px; transform: rotate(-6deg); padding: 10px 0; z-index: 10;"
    >
      <div class="flex overflow-hidden">
        <div class="animate-marquee flex shrink-0 whitespace-nowrap">
          <span
            v-for="i in 12"
            :key="'a' + i"
            class="font-body font-bold text-white text-xs sm:text-sm md:text-base px-2 md:px-4 tracking-wide"
          >~ Commerce ~ Reviews ~ Community</span>
        </div>
        <div class="animate-marquee flex shrink-0 whitespace-nowrap" aria-hidden="true">
          <span
            v-for="i in 12"
            :key="'b' + i"
            class="font-body font-bold text-white text-xs sm:text-sm md:text-base px-2 md:px-4 tracking-wide"
          >~ Commerce ~ Reviews ~ Community</span>
        </div>
      </div>
    </div>

    <!-- Lime tape: tilted up -->
    <div
      class="absolute left-[-1%] right-[-1%] bg-parrot-tape2 border-y-2 border-black"
      style="top: 50px; transform: rotate(6deg); padding: 10px 0; z-index: 10;"
    >
      <div class="flex overflow-hidden">
        <div class="animate-marquee-reverse flex shrink-0 whitespace-nowrap">
          <span
            v-for="i in 12"
            :key="'c' + i"
            class="font-body font-bold text-black text-xs sm:text-sm md:text-base px-2 md:px-4 tracking-wide"
          >~ Commerce ~ Reviews ~ Community</span>
        </div>
        <div class="animate-marquee-reverse flex shrink-0 whitespace-nowrap" aria-hidden="true">
          <span
            v-for="i in 12"
            :key="'d' + i"
            class="font-body font-bold text-black text-xs sm:text-sm md:text-base px-2 md:px-4 tracking-wide"
          >~ Commerce ~ Reviews ~ Community</span>
        </div>
      </div>
    </div>
  </section>
</template>
