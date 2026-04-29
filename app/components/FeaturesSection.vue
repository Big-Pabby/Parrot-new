<script setup lang="ts">
const { observeElements } = useScrollAnimation();

const activeTab = ref("Verify");
const tabs = ["Verify", "Reviews", "Share", "Ask"];

onMounted(() => {
  observeElements(".scroll-animate", "animate-fade-in-up");
});

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
</script>

<template>
  <section class="bg-lavender">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-20">
      <!-- Heading -->
      <h2
        class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-black my-16 max-w-[700px] scroll-animate"
      >
        Know the truth about any business or product before you buy.
      </h2>

      <!-- Card -->
      <div
        class="bg-white border-2 border-black rounded-2xl shadow-brutal p-4 sm:p-6 md:p-8 lg:p-16 scroll-animate"
      >
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 md:mb-8 lg:mb-10 flex-wrap">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="[
              'px-4 sm:px-6 py-2.5 md:px-7 md:py-3 rounded-lg border-2 border-black shadow-brutal-sm font-body font-semibold text-sm sm:text-base md:text-lg transition-all min-w-[100px] sm:min-w-[120px] text-center',
              activeTab === tab
                ? 'bg-navy text-white'
                : 'bg-white text-black hover:bg-gray-50',
            ]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <Transition name="tab-fade" mode="out-in">
          <div
            :key="activeTab"
            class="flex flex-col lg:flex-row gap-12 items-start"
          >
            <!-- Phone Mockup -->
            <div class="md:w-6/12 w-full ">
              <img
                :src="tabContent[activeTab].image"
                alt="Parrot app feature"
                class="rounded-xl md:h-auto h-[400px] "
              />
            </div>

            <!-- Feature List -->
            <div class="flex-1 flex flex-col gap-6 md:gap-8 text-left">
              <h3
                class="font-heading text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] font-normal leading-tight text-black"
              >
                {{ tabContent[activeTab].title }}
              </h3>
              <div class="flex flex-col gap-4 md:gap-6">
                <div
                  v-for="bullet in tabContent[activeTab].bullets"
                  :key="bullet"
                  class="flex items-center gap-3 md:gap-4"
                >
                  <div
                    class="border-2 shadow-brutal-sm border-black rounded-[12px] p-2"
                  >
                    <img
                      src="/images/checkmark.svg"
                      alt=""
                      class="w-6 h-6 md:w-9 md:h-9 "
                    />
                  </div>

                  <span
                    class="font-body text-black text-base md:text-xl leading-relaxed"
                    >{{ bullet }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </Transition>
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

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
