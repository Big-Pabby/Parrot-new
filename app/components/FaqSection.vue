<script setup lang="ts">
const { observeElements } = useScrollAnimation()

const faqs = ref([
  {
    question: 'Is Parrot really free?',
    answer:
      'Yes. Downloading Parrot, creating your account, asking the community questions, reading reviews, and leaving your own reviews — all of it is completely free. There are no hidden charges, no premium tiers for basic access, and no subscriptions. Free means free.',
    open: true,
  },
  {
    question: 'Can a business delete or hide a review I leave about them?',
    answer:
      'No. Once a review is posted on Parrot, businesses cannot delete or hide it. That\'s the whole point — honest, permanent reviews that help real customers make real decisions.',
    open: false,
  },
  {
    question: 'How do I know the businesses on Parrot are real?',
    answer:
      'Every business on Parrot goes through a verification process. We check registration details, confirm legitimacy, and display verification badges on confirmed profiles. The community also flags suspicious listings.',
    open: false,
  },
  {
    question: 'What if I want to leave a review but I am worried about being identified?',
    answer:
      'Parrot gives you control over your privacy. You can choose to post anonymously or under a username. Your personal identity is never shared with the businesses you review.',
    open: false,
  },
  {
    question: 'Will Parrot take my review seriously or will it get buried?',
    answer:
      'Every review on Parrot is indexed and searchable. We don\'t use algorithmic suppression — your review lives on the business profile and contributes to their overall trust score. Every voice matters.',
    open: false,
  },
])

const toggle = (idx: number) => {
  faqs.value[idx].open = !faqs.value[idx].open
}

onMounted(() => {
  observeElements('.scroll-animate', 'animate-fade-in-up')
})
</script>

<template>
  <section class="bg-cream pb-20 lg:pb-28">
    <div class="max-w-[1100px] mx-auto px-8 lg:px-20">
      <!-- Heading -->
      <h2 class="font-heading text-5xl lg:text-[56px] font-bold text-center text-black mb-14 scroll-animate">
        FAQ
      </h2>

      <!-- Accordion -->
      <div class="flex flex-col gap-4 scroll-animate animate-fade-in-up-delay">
        <div
          v-for="(faq, idx) in faqs"
          :key="faq.question"
          class="border-2 border-black rounded-2xl overflow-hidden shadow-brutal-sm"
        >
          <!-- Question Row -->
          <button
            :class="[
              'w-full flex items-center gap-5 px-6 py-5 text-left transition-colors',
              faq.open ? 'bg-lavender' : 'bg-lavender',
            ]"
            :aria-expanded="faq.open"
            @click="toggle(idx)"
          >
            <!-- Icon -->
            <span
              :class="[
                'flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border-2 border-black transition-colors',
                faq.open ? 'bg-navy' : 'bg-white',
              ]"
            >
              <svg
                class="w-4 h-4 transition-transform"
                :class="faq.open ? 'text-white rotate-180' : 'text-navy'"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <span
              :class="[
                'font-heading font-normal leading-tight flex-1',
                faq.open ? 'text-2xl lg:text-2xl text-black' : 'text-2xl lg:text-3xl text-black',
              ]"
            >
              {{ faq.question }}
            </span>
          </button>

          <!-- Answer -->
          <Transition name="accordion">
            <div v-if="faq.open" class="bg-white border-t border-gray-100">
              <p class="font-body text-black text-base lg:text-lg leading-relaxed px-6 py-6">
                {{ faq.answer }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
