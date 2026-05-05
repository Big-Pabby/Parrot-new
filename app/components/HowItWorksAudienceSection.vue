<script setup lang="ts">
interface Step {
  title: string
  description: string
}

const props = defineProps<{
  number: string
  label: string
  headline: string
  steps: Step[]
  quote: string
  ctaText: string
  ctaHref?: string
  image?: string
}>()

const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!sectionRef.value) return

  const elements = sectionRef.value.querySelectorAll('.hw-animate')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).style.animationPlayState = 'running'
          ;(entry.target as HTMLElement).classList.add('hw-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  elements.forEach((el) => observer.observe(el))
})
</script>

<template>
  <section ref="sectionRef" class="py-20 lg:py-28">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20">
      
      <!-- Section label -->
      <p class="font-body text-black text-lg mb-5 hw-animate">
        {{ number }} {{ label }}
      </p>

      <!-- Headline -->
      <h2
        class="font-heading text-4xl lg:text-[56px] font-normal leading-tight text-black mb-12 max-w-[1050px] hw-animate"
        style="animation-delay: 0.1s"
      >
        {{ headline }}
      </h2>

      

      <div class="flex flex-col lg:flex-row lg:gap-12 items-stretch">
        
        <!-- Content card -->
        <div class="flex-1">
          <div
            class="bg-white border-2 border-black rounded-2xl p-10 lg:p-16 space-y-8 hw-animate h-full"
            style="box-shadow: var(--shadow-brutal); animation-delay: 0.2s"
          >
           <!-- Image -->
        <div class="lg:w-[500px] lg:shrink-0 mt-8 lg:mt-0 hidden lg:block hw-animate" style="animation-delay: 0.3s">
          <img
            v-if="image"
            :src="image"
            :alt="label + ' image'"
            class="w-full rounded-2xl border-2 border-black"
            style="box-shadow: var(--shadow-brutal)"
          />
        </div>
            <!-- Steps -->
            <div class="flex flex-col gap-8 mb-12">
              <div v-for="(step, i) in steps" :key="i">
                <p class="font-body text-lg font-bold text-black leading-snug mb-2">
                  {{ i + 1 }}.&nbsp;&nbsp;&nbsp;&nbsp;{{ step.title }}
                </p>
                <p class="font-body text-lg font-normal text-black leading-relaxed pl-10">
                  {{ step.description }}
                </p>
              </div>
            </div>

            <!-- Quote / closing text -->
            <p class="font-body text-lg text-black leading-relaxed mb-10">
              {{ quote }}
            </p>

            <!-- CTA button -->
            <a
              :href="ctaHref || '#'"
              class="inline-block bg-lime border-2 border-black text-black font-body text-base lg:text-lg font-medium px-7 py-2.5 rounded-lg hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              {{ ctaText }}
            </a>
          </div>
        </div>

       
      </div>
    </div>
  </section>
</template>

<style scoped>
.hw-animate {
  opacity: 0;
  transform: translateY(20px);
  animation: hwFadeInUp 0.65s ease-out forwards;
  animation-play-state: paused;
}

.hw-animate.hw-visible {
  animation-play-state: running;
}

@keyframes hwFadeInUp {
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
