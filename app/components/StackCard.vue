<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const { hideNavbar, showNavbar } = useNavbar()

const tabContent: Record<
  string,
  { title: string; bullets: string[]; description: string; image: string }
> = {
  Verify: {
    title: "Verify if a Business is Legit Before Paying",
    description:
      "Share your honest experience. Your review posts directly to the business profile and stays there permanently.",
    bullets: [
      "Owners identity verification",
      "Bank account verification",
      "Social handles and address verification",
      "What customers love and complain about",
    ],
    image: "/images/Verify.png",
  },
  Reviews: {
    title: "Know What Past Customers Have Experienced",
    description:
      "Ask the community anything about a business, product, or service before you spend.",
    bullets: [
      "Get honest reviews in video, voice note, text.",
      "Message reviewers to ask more questions about their review",
      "Get detailed reviews from Pro Reviewers.",
    ],
    image: "/images/Reviews.png",
  },
  Share: {
    title: "Share your reviews openly and freely",
    description:
      "Search verified reviews from real customers you can actually trust.",
    bullets: [
      "Share honest reviews in videos, voice note, or text",
      "Report scams and bad customer experience.",
      "Help other customers avoid bad buys",
      " Help businesses know how to improve.",
    ],
    image: "/images/Share.png",
  },
  Ask: {
    title: "Ask and Get Honest Answers from the Community",
    description: "Verify any business before handing over your money.",
    bullets: [
      "Ask for product and business recommendations.",
      "Interest and location-based answers",
      "Real customers not influencers.",
    ],
    image: "/images/Ask.png",
  },
};

const tabs = Object.keys(tabContent);
const activeTab = ref(tabs[0]);
const cards = ref<HTMLElement[]>([]);
let tl: gsap.core.Timeline;

onMounted(() => {
  tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".stack-section",
      start: "top top",
      end: "+=3000",
      scrub: true,
      pin: ".stack-sticky",
      onUpdate: (self) => {
        const index = Math.round(self.progress * (tabs.length - 1));
        activeTab.value = tabs[index];
      },
      onEnter: () => {
        hideNavbar()
      },
      onEnterBack: () => {
        hideNavbar()
      },
      onLeaveBack: () => {
        showNavbar()
      },
      onLeave: () => {
        showNavbar()
      },
    },
  });
});

function goToTab(tab: string) {
  const index = tabs.indexOf(tab);

  activeTab.value = tab;

  const st = ScrollTrigger.getAll().find((t) =>
    t.trigger?.classList?.contains("stack-section"),
  );

  if (!st) return;

  const progress = index / (tabs.length - 1);

  gsap.to(window, {
    scrollTo: st.start + (st.end - st.start) * progress,
    duration: 0.6,
    ease: "power2.out",
  });
}

onUnmounted(() => {
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
</script>

<template>
  <section class="stack-section relative h-[600vh] text-black">
    <div
      class="stack-sticky h-screen flex items-center justify-center overflow-hidden"
    >
      <div class="relative w-full h-[90vh]">
        <div
          class="stack-card h-full w-full rounded-3xl border-2 border-black bg-white shadow-brutal p-8"
        >
          <!-- Tabs -->
          <div class="flex gap-2 mb-6 flex-wrap">
            <button
              v-for="t in tabs"
              :key="t"
              :class="[
                'px-4 py-2 rounded-[8px] border-2 shadow-brutal-sm border-black',
                activeTab === t ? 'bg-navy text-white' : 'bg-white text-black',
              ]"
              @click="goToTab(t)"
            >
              {{ t }}
            </button>
          </div>

          <!-- CONTENT (ONLY ACTIVE TAB) -->
          <div class="flex gap-10">
            <div class="w-1/2">
              <img
                :src="tabContent[activeTab].image"
                class="rounded-xl h-[400px] object-cover"
              />
            </div>

            <div class="w-1/2 flex flex-col gap-6">
              <h2 class="text-4xl">
                {{ tabContent[activeTab].title }}
              </h2>

              <p class="text-gray-600">
                {{ tabContent[activeTab].description }}
              </p>

              <div class="flex flex-col gap-4">
                <div
                  v-for="bullet in tabContent[activeTab].bullets"
                  :key="bullet"
                  class="flex gap-3 items-center"
                >
                  <img src="/images/checkmark.svg" class="w-6 h-6" />
                  <span>{{ bullet }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
