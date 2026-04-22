<script setup lang="ts">
import { ref, Transition, onMounted } from "vue";

const currentSlide = ref<number>(0);

const observeElements = (selector: string, className: string) => {
  if (typeof window === "undefined") return;

  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
        }
      });
    },
    { threshold: 0.1 },
  );

  elements.forEach((el) => observer.observe(el));
};

onMounted(() => {
  observeElements(".scroll-animate", "animate-fade-in-up");
});

const slides = [
  {
    type: "UGC Creators",
    image: "/images/ugc-creator.png",
    description:
      "They post business and product discovery content in video, photo, and text — and they make it worth watching. Fun. Honest. Opinionated. Shareable.",
    quote:
      '"My video on the best Amala spot on the Island has been shared 800 times."',
    cta: "Become a UGC Creator",
  },
  {
    type: "Customers",
    image: "/images/avatar-femi.png",
    description:
      "Real buyers who leave honest reviews that actually help others make smart purchasing decisions without fear of losing their money.",
    quote: '"Parrot saved me from making the worst purchase of my year."',
    cta: "Join as a Customer",
  },
  {
    type: "Pro Reviewers",
    image: "/images/avatar-chidinma.jpg",
    description:
      "Expert reviewers who dig deep into products and services, giving detailed, trustworthy assessments that the community relies on.",
    quote: '"People use my content to make real buying decisions."',
    cta: "Become a Pro Reviewer",
  },
  {
    type: "Businesses",
    image: "/images/phone-hero.png",
    description:
      "Verified businesses that are transparent, trustworthy, and ready to be held accountable by real customer feedback.",
    quote: '"My conversion rate doubled in two months after joining Parrot."',
    cta: "Claim Your Business",
  },
];

const prev = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};
const next = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++;
  }
};

const isFirstSlide = () => currentSlide.value === 0;
const isLastSlide = () => currentSlide.value === slides.length - 1;
</script>

<template>
  <section class="bg-lavender pb-0 pt-8">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20 pb-20 lg:pb-28">
      <!-- Header Row -->
      <div
        class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-10"
      >
        <div class="max-w-[640px]">
          <h2
            class="font-heading text-4xl lg:text-[56px] font-bold leading-tight text-black mb-4 scroll-animate"
          >
            Four Kinds of People. One Goal
          </h2>
          <p class="font-body text-black text-xl leading-relaxed">
            Every customer, creator, reviewer, and business on Parrot is here
            for the same reason — to make sure no one buys blind.
          </p>
        </div>
        <!-- Nav Arrows -->
        <div class="flex gap-3 flex-shrink-0 self-start lg:self-auto lg:mt-4">
          <button
            :disabled="isFirstSlide()"
            class="w-12 h-12 flex items-center justify-center border-2 border-black rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            aria-label="Previous"
            @click="prev"
          >
            <svg
              class="w-5 h-5"
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
            :disabled="isLastSlide()"
            class="w-12 h-12 flex items-center justify-center border-2 border-black rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-navy"
            aria-label="Next"
            @click="next"
          >
            <svg
              class="w-5 h-5"
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

      <!-- Slide Card -->
      <div
        :key="currentSlide"
        class="bg-white border-2 border-black rounded-2xl shadow-brutal overflow-hidden"
      >
        <div class="flex flex-col lg:flex-row">
          <!-- Image -->
          <div class="lg:w-[45%] flex-shrink-0">
            <img
              :src="slides[currentSlide].image"
              :alt="slides[currentSlide].type"
              class="w-full h-64 lg:h-full max-h-[550px] object-cover border-b-2 lg:border-b-0 lg:border-r-2 border-black"
              style="min-height: 350px"
            />
          </div>
          <!-- Content -->
          <div class="flex-1 p-8 lg:p-12 flex flex-col justify-center gap-6">
            <h3
              class="font-heading text-4xl lg:text-5xl font-normal text-black"
            >
              {{ slides[currentSlide].type }}
            </h3>
            <div class="flex flex-col gap-5">
              <p class="font-body text-black text-xl leading-relaxed">
                {{ slides[currentSlide].description }}
              </p>
              <p class="font-body font-bold text-black text-xl leading-relaxed">
                {{ slides[currentSlide].quote }}
              </p>
            </div>
            <a
              href="#"
              class="inline-flex items-center border-2 border-black bg-parrot-amber text-black font-body font-medium text-base px-6 py-2.5 rounded-lg hover:brightness-95 transition-all self-start"
            >
              {{ slides[currentSlide].cta }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
}
.scroll-animate.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
