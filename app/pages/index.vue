<template>
  <div>
    <AppNavbar />

    <main>
      <!-- Hero: cream bg -->
      <HeroSection />
     
      <!-- Features + People: lavender bg -->

      <div class="bg-lavender ">
         <!-- Wave: lavender → cream -->
      <WaveSeparator from-color="#fff4d2" to-color="#c1c2ff" />
        <!-- Ticker tapes -->
        <MarqueeSection />
        <FeaturesSection />
        <PeopleSection />
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
