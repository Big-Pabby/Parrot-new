<script setup lang="ts">
defineProps<{
  fromColor?: string
  toColor?: string
  flip?: boolean
}>()
</script>

<template>
  <!-- Wave using the design SVG circles pattern, colored with CSS currentColor -->
  <div
    :class="['w-full overflow-hidden leading-none', flip ? 'rotate-180' : '']"
    :style="{ backgroundColor: toColor || '#fff4d2' }"
  >
    <svg
      viewBox="0 0 1512 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full block"
      preserveAspectRatio="none"
      style="height: 80px;"
    >
      <!-- Scalloped wave: lavender fill creates the transition -->
      <path
        d="M0,0 L1512,0 L1512,50
          Q1484,100 1456,50 Q1428,0 1400,50 Q1372,100 1344,50
          Q1316,0 1288,50 Q1260,100 1232,50 Q1204,0 1176,50
          Q1148,100 1120,50 Q1092,0 1064,50 Q1036,100 1008,50
          Q980,0 952,50 Q924,100 896,50 Q868,0 840,50
          Q812,100 784,50 Q756,0 728,50 Q700,100 672,50
          Q644,0 616,50 Q588,100 560,50 Q532,0 504,50
          Q476,100 448,50 Q420,0 392,50 Q364,100 336,50
          Q308,0 280,50 Q252,100 224,50 Q196,0 168,50
          Q140,100 112,50 Q84,0 56,50 Q28,100 0,50 Z"
        :fill="fromColor || '#c1c2ff'"
      />
    </svg>
  </div>
</template>
