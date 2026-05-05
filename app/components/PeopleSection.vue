<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const { hideNavbar, showNavbar } = useNavbar();

const peopleContent: Record<
  string,
  {
    type: string;
    image: string;
    description: string;
    quote: string;
    cta: string;
  }
> = {
  "UGC Creators": {
    type: "UGC Creators",
    image: "/images/ugc-creator.png",
    description:
      "They post business and product discovery content in video, photo, and text — and they make it worth watching. Fun. Honest. Opinionated. Shareable.",
    quote:
      '"My video on the best Amala spot on the Island has been shared 800 times."',
    cta: "Become a UGC Creator",
  },
  "Everyday Customers": {
    type: "Everyday Customers",
    image: "/images/customers.png",
    description:
      "They bought something. They experienced something. They came here to tell the truth about it. They are the realest review you will ever read.",
    quote: '"Turns out, thirty people needed to hear what I had to say."',
    cta: "Join as a Customer",
  },
  "Pro Reviewers": {
    type: "Pro Reviewers",
    image: "/images/reviewers.png",
    description:
      "They go all the way in. They order the product. They visit the location. They test the service. They write the kind of review that leaves no questions unanswered.",
    quote:
      '"I spent two weeks with the DANG Hydra Glow Gel. You needed to know what I found."',
    cta: "Become a Pro Reviewer",
  },
  "Verified Businesses": {
    type: "Verified Businesses",
    image: "/images/business.png",
    description:
      "They post business and product discovery content in video, photo, and text — and they make it worth watching. Fun. Honest. Opinionated. Shareable.",
    quote:
      '"My video on the best Amala spot on the Island has been shared 800 times."',
    cta: "Claim Your Business",
  },
};

const tabs = Object.keys(peopleContent);
const activeTab = ref(tabs[0]);
let tl: gsap.core.Timeline;

onMounted(() => {
  tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".people-section",
      start: "top top",
      end: "+=3000",
      scrub: true,
      pin: ".people-sticky",
      onUpdate: (self) => {
        const index = Math.round(self.progress * (tabs.length - 1));
        activeTab.value = tabs[index];
      },
      onEnter: () => {
        hideNavbar();
      },
      onEnterBack: () => {
        hideNavbar();
      },
      onLeaveBack: () => {
        showNavbar();
      },
      onLeave: () => {
        showNavbar();
      },
    },
  });
});

function goToTab(tab: string) {
  const index = tabs.indexOf(tab);

  activeTab.value = tab;

  const st = ScrollTrigger.getAll().find((t) =>
    t.trigger?.classList?.contains("people-section"),
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
  <section class="people-section relative h-[600vh] text-black">
    <div
      class="people-sticky h-screen flex items-center justify-center overflow-hidden"
    >
      <div class="relative w-full h-[90vh]">
        <div
          class="people-card h-full w-full rounded-3xl border-2 border-black bg-white shadow-brutal p-8 md:p-12"
        >
          <!-- CONTENT (ONLY ACTIVE TAB) -->
          <div class="flex gap-8 md:gap-12 h-full">
            <div class="w-full lg:w-1/2">
              <img
                :src="peopleContent[activeTab].image"
                :alt="peopleContent[activeTab].type"
                class="rounded-xl h-[300px] md:h-[400px] w-full object-cover shadow-brutal"
              />
            </div>

            <div
              class="w-full lg:w-1/2 flex flex-col justify-center gap-4 md:gap-6"
            >
              <h3
                class="font-heading text-3xl md:text-4xl lg:text-5xl font-normal text-black"
              >
                {{ peopleContent[activeTab].type }}
              </h3>

              <div class="flex flex-col gap-4 md:gap-5">
                <p
                  class="font-body text-black text-base md:text-lg leading-relaxed"
                >
                  {{ peopleContent[activeTab].description }}
                </p>
                <p
                  class="font-body font-bold text-black text-base md:text-lg leading-relaxed"
                >
                  {{ peopleContent[activeTab].quote }}
                </p>
              </div>

              <a
                :href="
                  peopleContent[activeTab].cta === 'Claim Your Business'
                    ? 'https://parrot.id/claim-business'
                    : 'https://onelink.to/nwmnzy'
                "
                class="inline-flex items-center border-2 border-black bg-parrot-amber text-black font-body font-medium text-sm md:text-base px-5 md:px-6 py-2 md:py-2.5 rounded-lg hover:brightness-95 transition-all self-start"
              >
                {{ peopleContent[activeTab].cta }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll animation for header only */
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
</style>
