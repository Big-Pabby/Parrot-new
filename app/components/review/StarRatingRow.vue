<script setup lang="ts">
import { ref } from "vue";

interface Rate {
  id: number;
}

const props = defineProps<{
  label: string;
  modelValue: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const rates = ref<Rate[]>([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
]);

const hoverRating = ref(0);

const getColor = (id: number): string => {
  if (hoverRating.value >= id) {
    if (hoverRating.value === 1) {
      return "#D20000";
    } else if (hoverRating.value === 2 || hoverRating.value === 3) {
      return "#FFC700";
    } else if (hoverRating.value >= 4) {
      return "#158D30";
    }
  } else if (!hoverRating.value && props.modelValue >= id) {
    if (props.modelValue < 2) {
      return "#D20000";
    } else if (props.modelValue < 4) {
      return "#FFC700";
    } else {
      return "#158D30";
    }
  }

  return "#C8C8C8";
};

const isStarFilled = (index: number): boolean => {
  return index <= props.modelValue;
};

const handleRating = (value: number) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex items-center justify-between py-2">
    <span class="text-[14px] text-review-text-mid font-rubik">{{ label }}</span>
    <div class="flex gap-1">
      <div
        v-for="rate in rates"
        :key="rate.id"
        class="w-[20px] h-[20px] rounded-[5px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
        :style="{ background: getColor(rate.id) }"
        :aria-label="`Rate ${rate.id} star${rate.id !== 1 ? 's' : ''}`"
        @mouseenter="hoverRating = rate.id"
        @mouseleave="hoverRating = 0"
        @click="handleRating(rate.id)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            fill="#fff"
            d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
