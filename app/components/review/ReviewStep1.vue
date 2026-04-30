<script setup lang="ts">
import type { Product } from "~/pages/business/types/product";
import type { Employee } from "~/pages/business/types/employee";
import {
  UseGetProductsByBusiness,
  UseGetEmployeesByBusiness,
} from "~/pages/business/hooks";

const props = defineProps<{
  businessName?: string;
  address?: string;
  city?: string;
  logo?: string;
  ratingCategories?: string[];
  businessId: string;
}>();

const emit = defineEmits<{
  continue: [
    data: {
      ratings: Record<string, number>;
      productIds: string[];
      employeeIds: string[];
      reviewDate: string;
    },
  ];
}>();

const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  const e: Record<string, string> = {};

  // Check if all ratings are filled (> 0)
  categories.value.forEach((cat) => {
    if (!ratings[cat] || Number(ratings[cat]) <= 0) {
      e.ratings = "Please rate all categories.";
    }
  });

  // Check if date is filled
  if (!reviewDate.value) {
    e.date = "Please select a date.";
  } else {
    // Validate date is within the last 90 days
    const selectedDate = new Date(reviewDate.value);
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);

    if (selectedDate < minDateObj || selectedDate > maxDateObj) {
      e.date = "Please select a date within the last 90 days.";
    }
  }

  errors.value = e;
  return Object.keys(e).length === 0;
});

const onContinue = () => {
  if (!isFormValid.value) return;

  const productIds = selectedServices.value
    .map((name) => {
      const doc = productsData.value?.data?.docs.find(
        (p: any) => p.name === name,
      );
      return doc?._id;
    })
    .filter((id): id is string => !!id);

  const employeeIds = selectedStaff.value
    .map((name) => {
      const doc = employeesData.value?.data?.docs.find(
        (e: any) => e.name === name,
      );
      return doc?._id;
    })
    .filter((id): id is string => !!id);

  emit("continue", {
    ratings: { ...ratings },
    productIds,
    employeeIds,
    reviewDate: reviewDate.value,
  });
};

// Products search and pagination
const productsSearch = ref("");
const productsPage = ref(1);
const productsLimit = ref(5);
const {
  data: productsData,
  isLoading: productsLoading,
  error: productsError,
} = UseGetProductsByBusiness(
  props.businessId,
  productsSearch,
  productsPage,
  productsLimit,
);

// Employees search and pagination
const employeesSearch = ref("");
const employeesPage = ref(1);
const employeesLimit = ref(5);
const {
  data: employeesData,
  isLoading: employeesLoading,
  error: employeesError,
} = UseGetEmployeesByBusiness(
  props.businessId,
  employeesSearch,
  employeesPage,
  employeesLimit,
);

const categories = computed(() =>
  props.ratingCategories?.length
    ? props.ratingCategories
    : ["Customer Service", "Product Quality", "Value for Money", "Cleanliness"],
);

const services = computed(() =>
  productsData.value?.data?.docs?.length
    ? productsData.value?.data?.docs.map((p) => p.name)
    : [],
);

const staffList = computed(() =>
  employeesData.value?.data?.docs?.length
    ? employeesData.value?.data?.docs.map((e) => e.name)
    : [],
);

// Pagination info
const productsTotalPages = computed(
  () => productsData.value?.data?.totalPages || 0,
);
const employeesTotalPages = computed(
  () => employeesData.value?.data?.totalPages || 0,
);

const selectedServices = ref<string[]>([]);
const selectedStaff = ref<string[]>([]);
const maxDate = new Date().toISOString().split("T")[0];
const reviewDate = ref(maxDate);
const servicesOpen = ref(true);
const staffOpen = ref(true);
const ratings = reactive<Record<string, number | string>>({});

watch(
  categories,
  (newCategories) => {
    newCategories.forEach((cat) => {
      if (!(cat in ratings)) {
        ratings[cat] = 0;
      }
    });
  },
  { immediate: true },
);

const toggleService = (item: string) => {
  const idx = selectedServices.value.indexOf(item);
  if (idx > -1) selectedServices.value.splice(idx, 1);
  else selectedServices.value.push(item);
};

const toggleStaff = (item: string) => {
  const idx = selectedStaff.value.indexOf(item);
  if (idx > -1) selectedStaff.value.splice(idx, 1);
  else selectedStaff.value.push(item);
};

const minDate = new Date(Date.now() - 89 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Main card -->
    <div
      class="bg-white rounded-xl border border-review-border overflow-hidden"
    >
      <!-- Business info -->
      <div class="flex items-center gap-4 px-5 py-4 border-b border-[#e8e8e8]">
        <img
          :src="logo || '/images/review-business-logo.png'"
          :alt="`${businessName} logo`"
          class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div class="flex flex-col gap-0.5">
          <h3
            class="text-[16px] font-medium text-review-text-dark leading-tight"
          >
            {{ businessName }}
          </h3>
          <p class="text-[13px] text-[#57575a]">
            {{ address }}{{ city ? `, ${city}` : "" }}
          </p>
        </div>
      </div>

      <!-- Rating section -->
      <div class="px-5 py-4 border-b border-[#e8e8e8]">
        <p class="text-[14px] font-medium text-review-text-mid mb-2">Rating</p>
        <div class="flex flex-col divide-y divide-[#f3f3f3]">
          <ReviewStarRatingRow
            v-for="(cat, idx) in categories"
            :key="cat"
            :label="cat"
            :model-value="Number(ratings[cat]) || 0"
            @update:model-value="ratings[cat] = $event"
          />
        </div>
        <p
          v-if="errors.ratings"
          class="text-[12px] text-red-500 mt-2 font-medium"
        >
          {{ errors.ratings }}
        </p>
      </div>

      <!-- What did you buy? (collapsible) -->
      <div class="border-b border-[#e8e8e8]">
        <button
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
          :aria-expanded="servicesOpen"
          @click="servicesOpen = !servicesOpen"
        >
          <span class="text-[14px] font-medium text-review-text-mid text-left"
            >What did you buy? <span class="text-[12px] text-review-text-muted">(optional)</span></span
          >
          <svg
            class="w-4 h-4 text-review-text-mid flex-shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': servicesOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <Transition name="collapse">
          <div v-show="servicesOpen" class="px-5 pb-3 flex flex-col gap-3">
            <!-- Search input -->
            <input
              v-model="productsSearch"
              type="text"
              placeholder="Search products..."
              class="w-full px-3 py-2 rounded-lg border border-review-border text-[14px] focus:outline-none focus:border-review-primary transition-colors text-review-text-mid"
            />

            <!-- Loading state -->
            <div
              v-if="productsLoading"
              class="text-center text-[13px] text-review-text-muted py-2"
            >
              Loading products...
            </div>

            <!-- Error state -->
            <div
              v-else-if="productsError"
              class="text-center text-[13px] text-red-500 py-2"
            >
              Failed to load products
            </div>

            <!-- Products list -->
            <div v-else class="flex flex-col">
              <button
                v-for="item in services"
                :key="item"
                class="flex items-center justify-between py-2 px-1 rounded hover:bg-gray-50 transition-colors w-full"
                @click="toggleService(item)"
              >
                <span class="text-[14px] text-black">{{ item }}</span>
                <div
                  class="w-[18px] h-[18px] border rounded-sm flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="
                    selectedServices.includes(item)
                      ? 'bg-review-primary border-review-primary'
                      : 'bg-white border-review-border'
                  "
                >
                  <svg
                    v-if="selectedServices.includes(item)"
                    viewBox="0 0 24 24"
                    class="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Pagination -->
            <div
              v-if="productsTotalPages > 1"
              class="flex items-center justify-between pt-2 border-t border-[#f3f3f3]"
            >
              <button
                :disabled="productsPage === 1"
                class="px-2 py-1 text-[12px] rounded border border-review-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-review-primary"
                @click="productsPage = Math.max(1, productsPage - 1)"
              >
                Previous
              </button>
              <span class="text-[12px] text-review-text-muted"
                >{{ productsPage }} / {{ productsTotalPages }}</span
              >
              <button
                :disabled="productsPage === productsTotalPages"
                class="px-2 py-1 text-[12px] rounded border border-review-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-review-primary"
                @click="
                  productsPage = Math.min(productsTotalPages, productsPage + 1)
                "
              >
                Next
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Who attended? (collapsible) -->
      <div class="border-b border-[#e8e8e8]">
        <button
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
          :aria-expanded="staffOpen"
          @click="staffOpen = !staffOpen"
        >
          <span class="text-[14px] font-medium text-review-text-mid text-left"
            >Who attended to you?<span class="text-[12px] text-review-text-muted">(optional)</span></span
          >
          <svg
            class="w-4 h-4 text-review-text-mid flex-shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': staffOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <Transition name="collapse">
          <div v-show="staffOpen" class="px-5 pb-3 flex flex-col gap-3">
            <!-- Search input -->
            <input
              v-model="employeesSearch"
              type="text"
              placeholder="Search employees..."
              class="w-full px-3 py-2 rounded-lg border border-review-border text-[14px] focus:outline-none focus:border-review-primary transition-colors text-review-text-mid"
            />

            <!-- Loading state -->
            <div
              v-if="employeesLoading"
              class="text-center text-[13px] text-review-text-muted py-2"
            >
              Loading employees...
            </div>

            <!-- Error state -->
            <div
              v-else-if="employeesError"
              class="text-center text-[13px] text-red-500 py-2"
            >
              Failed to load employees
            </div>

            <!-- Employees list -->
            <div v-else class="flex flex-col">
              <button
                v-for="person in staffList"
                :key="person"
                class="flex items-center justify-between py-2 px-1 rounded hover:bg-gray-50 transition-colors w-full"
                @click="toggleStaff(person)"
              >
                <span class="text-[14px] text-black">{{ person }}</span>
                <div
                  class="w-[18px] h-[18px] border rounded-sm flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="
                    selectedStaff.includes(person)
                      ? 'bg-review-primary border-review-primary'
                      : 'bg-white border-review-border'
                  "
                >
                  <svg
                    v-if="selectedStaff.includes(person)"
                    viewBox="0 0 24 24"
                    class="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Pagination -->
            <div
              v-if="employeesTotalPages > 1"
              class="flex items-center justify-between pt-2 border-t border-[#f3f3f3]"
            >
              <button
                :disabled="employeesPage === 1"
                class="px-2 py-1 text-[12px] rounded border border-review-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-review-primary"
                @click="employeesPage = Math.max(1, employeesPage - 1)"
              >
                Previous
              </button>
              <span class="text-[12px] text-review-text-muted"
                >{{ employeesPage }} / {{ employeesTotalPages }}</span
              >
              <button
                :disabled="employeesPage === employeesTotalPages"
                class="px-2 py-1 text-[12px] rounded border border-review-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-review-primary"
                @click="
                  employeesPage = Math.min(
                    employeesTotalPages,
                    employeesPage + 1,
                  )
                "
              >
                Next
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- When did it happen? -->
      <div class="px-5 py-4">
        <div class="flex flex-col gap-1 mb-3">
          <p class="text-[14px] font-medium text-review-text-mid">
            When did it happen?
          </p>
          <p class="text-[11px] text-review-text-dark leading-snug">
            You can only share reviews for experiences within the last 90 days.
          </p>
        </div>
        <div class="relative">
          <input
            v-model="reviewDate"
            type="date"
            :max="maxDate"
            :min="minDate"
            aria-label="Review date"
            :class="[
              'w-full px-4 py-3 rounded-[10px] border text-[14px] bg-white focus:outline-none transition-colors cursor-pointer',
              errors.date
                ? 'border-red-400 text-red-600 focus:border-red-500'
                : 'border-review-border text-review-text-muted focus:border-review-primary',
            ]"
          />
        </div>
        <p v-if="errors.date" class="text-[12px] text-red-500 mt-2 font-medium">
          {{ errors.date }}
        </p>
      </div>
    </div>

    <!-- Continue button -->
    <button
      :disabled="!isFormValid"
      :class="[
        'w-full py-3.5 text-white text-[14px] font-medium rounded-full transition-all',
        isFormValid
          ? 'bg-review-primary hover:brightness-110 active:scale-[0.98] cursor-pointer'
          : 'bg-review-primary/60 cursor-not-allowed opacity-70',
      ]"
      @click="onContinue"
    >
      Continue
    </button>
  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
