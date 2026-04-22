<script setup lang="ts">
defineProps<{
  label: string
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hovered = ref(0)
</script>

<template>
  <div class="flex items-center justify-between py-2">
    <span class="text-[14px] text-review-text-muted font-rubik">{{ label }}</span>
    <div class="flex items-center gap-0.5">
      <button
        v-for="star in 5"
        :key="star"
        class="w-[22px] h-[22px] transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        :aria-label="`Rate ${star} star${star !== 1 ? 's' : ''}`"
        @mouseenter="hovered = star"
        @mouseleave="hovered = 0"
        @click="emit('update:modelValue', star)"
      >
        <svg viewBox="0 0 24 24" class="w-full h-full">
          <path
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            :fill="(hovered || modelValue) >= star ? 'var(--color-review-star)' : 'none'"
            :stroke="(hovered || modelValue) >= star ? 'var(--color-review-star)' : '#bfbfc1'"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
