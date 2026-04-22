<script setup lang="ts">
import { UseGetBusiness, UseGetEmployeesByBusiness } from "../../hooks";

const route = useRoute();
const router = useRouter();

const username = computed(() => route.params.slug as string);

const { businessData, isLoading, error } = UseGetBusiness(username.value);
const businessId = computed(
  () => businessData.value?.fullBusinessProfile._id || "",
);

const currentStep = ref(1);
const totalSteps = 2;

const stepTitle = computed(() =>
  currentStep.value === 1 ? "Rate Your Experience" : "Share Your Review",
);

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    router.back();
  }
};

const goNext = () => {
  currentStep.value = 2;
};

const refresh = () => {
  window.location.reload();
};
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- Sticky header -->
    <header
      class="sticky top-0 z-20 bg-cream border-b border-[#e8e0c0] px-4 py-4"
    >
      <div class="max-w-xl mx-auto relative flex items-center justify-center">
        <!-- Back button -->
        <button
          class="absolute left-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Go back"
          @click="goBack"
        >
          <svg
            viewBox="0 0 24 24"
            class="w-5 h-5 text-review-text-dark"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <!-- Title & step -->
        <div class="text-center">
          <Transition name="title-swap" mode="out-in">
            <h1
              :key="currentStep"
              class="text-[18px] font-medium text-[#000005] leading-tight"
            >
              {{ stepTitle }}
            </h1>
          </Transition>
          <p class="text-[13px] text-review-text-mid mt-0.5">
            {{ currentStep }} of {{ totalSteps }}
          </p>
        </div>
      </div>
      <!-- Business info banner -->
      <!-- <div v-if="businessData?.fullBusinessProfile" class="max-w-xl mx-auto mt-3 flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-review-primary/10 flex items-center justify-center text-review-primary font-semibold text-lg">
          {{ businessData.fullBusinessProfile.businessName.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-[15px] font-medium text-[#000005] truncate">
            {{ businessData.fullBusinessProfile.businessName }}
          </h2>
          <p class="text-[13px] text-review-text-mid truncate">
            {{ businessData.fullBusinessProfile.address }}, {{ businessData.fullBusinessProfile.city }}
          </p>
        </div>
      </div>
      <div v-else-if="isLoading" class="max-w-xl mx-auto mt-3 flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div class="h-3 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div v-else-if="error" class="max-w-xl mx-auto mt-3 text-center text-red-500 text-sm">
        Failed to load business info
      </div> -->
    </header>

    <!-- Step progress bar -->
    <div class="h-1 bg-[#e8e0c0]">
      <div
        class="h-full bg-review-primary transition-all duration-400 ease-out"
        :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
      />
    </div>

    <!-- Page content -->
    <main class="max-w-xl mx-auto px-4 py-6 pb-12">
      <!-- Full page loading state -->
      <div v-if="isLoading" class="space-y-6">
        <div class="animate-pulse space-y-4">
          <!-- Business info skeleton -->
          <div
            class="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e8e0c0]"
          >
            <div class="w-14 h-14 rounded-full bg-[#e8e0c0]" />
            <div class="flex-1 space-y-2">
              <div class="h-5 w-40 bg-[#e8e0c0] rounded" />
              <div class="h-4 w-56 bg-[#e8e0c0] rounded" />
            </div>
          </div>
          <!-- Categories skeleton -->
          <div class="space-y-3">
            <div class="h-4 w-32 bg-[#e8e0c0] rounded" />
            <div class="grid grid-cols-2 gap-3">
              <div class="h-20 bg-[#e8e0c0] rounded-xl" />
              <div class="h-20 bg-[#e8e0c0] rounded-xl" />
            </div>
          </div>
          <!-- Products skeleton -->
          <div class="space-y-2">
            <div class="h-4 w-24 bg-[#e8e0c0] rounded" />
            <div class="h-12 bg-[#e8e0c0] rounded-lg" />
          </div>
          <!-- Employees skeleton -->
          <div class="space-y-2">
            <div class="h-4 w-20 bg-[#e8e0c0] rounded" />
            <div class="h-12 bg-[#e8e0c0] rounded-lg" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 text-red-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p class="text-red-600 font-medium">Failed to load business</p>
        <p class="text-red-500 text-sm mt-1">{{ error.message }}</p>
        <button
          class="mt-4 px-4 py-2 bg-review-primary text-white rounded-lg text-sm font-medium"
          @click="refresh"
        >
          Try Again
        </button>
      </div>

      <Transition v-else name="slide-step">
        <div>
          <div v-show="currentStep === 1" key="review-step">
            <ReviewStep1
              :business-name="businessData?.fullBusinessProfile?.businessName"
              :address="businessData?.fullBusinessProfile?.address"
              :city="businessData?.fullBusinessProfile?.city"
              :logo="
                businessData?.fullBusinessProfile?.media?.businessLogo?.location
              "
              :rating-categories="
                businessData?.fullBusinessProfile?.businessCategory[0]
                  ?.metrics || []
              "
              :businessId="businessId"
              @continue="goNext"
            />
          </div>
          <div v-show="currentStep === 2" key="review-step">
            <ReviewStep2 />
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.slide-step-enter-active,
.slide-step-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.slide-step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.slide-step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-step-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-step-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.title-swap-enter-active,
.title-swap-leave-active {
  transition: opacity 0.15s ease;
}
.title-swap-enter-from,
.title-swap-leave-to {
  opacity: 0;
}
</style>
