<template>
  <div class="overflow-x-hidden">
    <AppNavbar />

    <main class="pt-16 md:pt-20">
      <!-- Hero: cream bg -->
      <HeroSection />

      <!-- Features + People: lavender bg -->

      <div class="bg-lavender">
        <!-- Wave: lavender → cream -->
        <WaveSeparator from-color="#fff4d2" to-color="#c1c2ff" />
        <!-- Ticker tapes -->
        <MarqueeSection />
        <FeaturesSection />
        <div
          class="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-20 py-16 md:py-20 lg:py-28"
        >
          <div
            class="flex flex-col lg:flex-row lg:items-start justify-between gap-4 md:gap-6 mb-8 md:mb-10"
          >
            <div class="">
              <h2
                class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-black mb-4 scroll-animate"
              >
                Four Kinds of People. One Goal
              </h2>
              <p
                class="font-body max-w-[640px] text-black text-base md:text-xl leading-relaxed"
              >
                Every customer, creator, reviewer, and business on Parrot is
                here for the same reason — to make sure no one buys blind.
              </p>
            </div>
            <!-- Nav Arrows -->
            <div
              class="flex gap-3 flex-shrink-0 self-start lg:self-auto lg:mt-4"
            >
              <button
                class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-black rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                aria-label="Previous"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-black rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-navy"
                aria-label="Next"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
            <PeopleSection />
        </div>
      
      </div>

      <!-- Wave: lavender → cream -->
      <WaveSeparator from-color="#c1c2ff" to-color="#fff4d2" />

      <!-- Testimonials + FAQ: cream bg -->
      <div class="bg-cream">
        <TestimonialsSection />
        <FaqSection />
      </div>

      <!-- Wave: cream → lavender -->
      <WaveSeparator from-color="#fff4d2" to-color="#c1c2ff" />

      <!-- CTA: lavender bg -->
      <CtaSection />
    </main>

    <AppFooter />
  </div>
</template>
