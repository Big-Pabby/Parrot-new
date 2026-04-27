<script setup lang="ts">
import { ref, computed, onMounted, Transition } from "vue";

const currentPage = ref<number>(1);
const itemsPerPage = 3;

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

const testimonials = [
  {
    name: "Adaeze",
    location: "Lagos",
    avatar: "https://i.pravatar.cc/80?u=adaeze-lagos",
    text: '"I almost sent 45k to a vendor I found on Instagram. Checked Parrot first. Fourteen people had reviewed them. Four of those reviews saved me from making the worst purchase of my year."',
  },
  {
    name: "Femi",
    location: "Ibadan",
    avatar: "/images/avatar-femi.png",
    text: '"I run a small skincare business and Parrot changed everything for me. My customers now leave reviews that new customers can actually find and trust. My conversion rate doubled in two months."',
  },
  {
    name: "Chidinma",
    location: "Abuja",
    avatar: "/images/avatar-chidinma.jpg",
    text: '"As a content creator, Parrot gave me a platform where my reviews actually mean something. People use my content to make real buying decisions. That accountability makes me better at what I do."',
  },
  {
    name: "Emeka",
    location: "Port Harcourt",
    avatar: "https://i.pravatar.cc/80?u=emeka-ph",
    text: '"Before Parrot, I lost money twice buying from unverified vendors. Now I always check Parrot before spending anything significant. It\'s become my first stop before any purchase."',
  },
  {
    name: "Ngozi",
    location: "Enugu",
    avatar: "https://i.pravatar.cc/80?u=ngozi-enugu",
    text: '"The community on Parrot is incredibly honest and helpful. I\'ve discovered amazing local businesses I never would have found otherwise, and I trust them because real people stand behind them."',
  },
];

const totalPages = computed(() =>
  Math.ceil(testimonials.length / itemsPerPage),
);

const visibleTestimonials = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return testimonials.slice(start, end);
});

const prev = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const next = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
</script>

<template>
  <section class="bg-cream py-20 lg:py-28">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20">
      <!-- Heading -->
      <div class="text-center mb-16">
        <h2
          class="font-heading text-4xl lg:text-[56px] font-semibold leading-tight text-black mb-4 scroll-animate"
        >
          The community is already talking.
        </h2>
        <p class="font-body text-black text-xl">
          Here is what our members are saying.
        </p>
      </div>

      <!-- Testimonial Cards -->
      <div
        :key="currentPage"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <div
          v-for="(t, idx) in visibleTestimonials"
          :key="t.name + currentPage"
          :class="[
            'bg-white border-2 border-black rounded-2xl p-8 flex flex-col gap-6',
            idx === 1 ? 'shadow-brutal' : 'shadow-brutal-sm',
          ]"
        >
          <div class="flex items-center gap-4">
            <img
              :src="t.avatar"
              :alt="t.name"
              class="w-16 h-16 rounded-full object-cover border-2 border-black shadow-brutal-sm flex-shrink-0"
            />
            <div>
              <p class="font-heading text-2xl font-semibold text-black">
                {{ t.name }}
              </p>
              <p class="font-body text-base text-gray-600">
                {{ t.location }}
              </p>
            </div>
          </div>
          <p class="font-body text-base text-black leading-relaxed flex-1">
            {{ t.text }}
          </p>
        </div>
      </div>

      <!-- Carousel Navigation -->
      <div class="flex items-center justify-center gap-6">
        <button
          class="w-11 h-11 flex items-center justify-center border-2 border-black rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors shadow-brutal-sm disabled:opacity-40"
          aria-label="Previous testimonials"
          :disabled="currentPage === 1"
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

        <!-- Dots -->
        <div class="flex gap-2">
          <button
            v-for="i in totalPages"
            :key="i"
            :class="[
              'rounded-sm transition-all',
              currentPage === i
                ? 'w-6 h-3 bg-navy'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400',
            ]"
            :aria-label="`Go to page ${i}`"
            @click="currentPage = i"
          />
        </div>

        <button
          class="w-11 h-11 flex items-center justify-center border-2 border-black rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors shadow-brutal-sm disabled:opacity-40"
          aria-label="Next testimonials"
          :disabled="currentPage === totalPages"
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
  </section>
</template>

<style scoped>
.cards-fade-enter-active {
  transition: opacity 0.2s ease-in;
}
.cards-fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.cards-fade-enter-from {
  opacity: 0;
}
.cards-fade-leave-to {
  opacity: 0;
}
</style>
