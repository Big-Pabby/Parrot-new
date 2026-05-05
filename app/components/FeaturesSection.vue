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
        class="font-heading text-3xl sm:text-4xl md:text-4xl font-bold leading-tight text-black mt-20 mb-8 max-w-[700px] scroll-animate"
      >
        Everything you need to avoid bad buying decisions.
      </h2>
      <StackCard />

      
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
