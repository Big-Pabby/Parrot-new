<script setup lang="ts">
import { useSubmitPublicReview, useUploadMedia } from "~/pages/business/hooks";

// ─── Types ───────────────────────────────────────────────────────────────────
type ShareMode = "text" | "voice" | "video";

interface MediaItem {
  id: number;
  src: string;
  file?: File;
}

const props = defineProps<{
  ratings?: Record<string, number | string>;
  businessId: string;
  productIds: string[];
  employeeIds: string[];
  reviewDate: string;
}>();

// Media upload hook
const { uploadMultiple } = useUploadMedia();

// Submit review mutation
const { mutateAsync: submitReview, isPending: isSubmittingReview } =
  useSubmitPublicReview();

// ─── Tab state ───────────────────────────────────────────────────────────────
const activeTab = ref<ShareMode>("text");
const tabs: { value: ShareMode; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "voice", label: "Voice" },
  { value: "video", label: "Video" },
];

// ─── Download prompt modal state ──────────────────────────────────────────────
const showDownloadPrompt = ref(false);
const downloadPromptFeature = ref<ShareMode | null>(null);

// ─── Success modal state ──────────────────────────────────────────────────────
const showSuccessModal = ref(false);
const successMessage = ref("");

// ─── User info modal state ──────────────────────────────────────────────────────
const showUserInfoModal = ref(false);
const userFormData = ref({ firstName: "", lastName: "", email: "" });
const userFormErrors = ref<Record<string, string>>({});

// ─── Form state ──────────────────────────────────────────────────────────────
const reviewText = ref("");
const reviewTitle = ref("");
const errors = ref<Record<string, string>>({});
const toast = ref<{ message: string; type: "success" | "error" } | null>(null);
let nextId = 100;

// ─── Preview modal state ──────────────────────────────────────────────────────
const showPreview = ref(false);
const previewType = ref<"image" | "video" | null>(null);
const previewItems = ref<MediaItem[]>([]);
const previewIndex = ref(0);

const currentPreviewItem = computed(
  () => previewItems.value[previewIndex.value],
);

const openPreview = (
  items: MediaItem[],
  index: number,
  type: "image" | "video",
) => {
  previewItems.value = items;
  previewIndex.value = index;
  previewType.value = type;
  showPreview.value = true;
};

const closePreview = () => {
  showPreview.value = false;
  previewType.value = null;
};

const handleTabClick = (tabValue: ShareMode) => {
  if (tabValue === "voice" || tabValue === "video") {
    downloadPromptFeature.value = tabValue;
    showDownloadPrompt.value = true;
  } else {
    activeTab.value = tabValue;
  }
};

const handleDownloadApp = () => {
  successMessage.value = `Opening app store to download Parrot app...`;
  showDownloadPrompt.value = false;
  showSuccessModal.value = true;
  setTimeout(() => {
    showSuccessModal.value = false;
  }, 3000);
};

const goToNextPreview = () => {
  if (previewIndex.value < previewItems.value.length - 1) {
    previewIndex.value++;
  }
};

const goToPrevPreview = () => {
  if (previewIndex.value > 0) {
    previewIndex.value--;
  }
};

// ─── Waveform state ──────────────────────────────────────────────────────────
const showWaveform = ref(false);
const waveformContainer = ref<HTMLDivElement | null>(null);
const waveform = ref<any | null>(null);
const isWaveformPlaying = ref(false);

// ─── Text tab media ───────────────────────────────────────────────────────────
const textMedia = ref<MediaItem[]>([]);
const textFileInput = ref<HTMLInputElement | null>(null);

const openTextFilePicker = () => textFileInput.value?.click();

const onTextFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  for (const file of files) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
      continue;
    const src = URL.createObjectURL(file);
    textMedia.value.push({ id: ++nextId, src, file });
  }
  (event.target as HTMLInputElement).value = "";
};

const removeTextMedia = (id: number) => {
  const item = textMedia.value.find((m) => m.id === id);
  if (item) URL.revokeObjectURL(item.src);
  textMedia.value = textMedia.value.filter((m) => m.id !== id);
};

// ─── Voice tab media ──────────────────────────────────────────────────────────
const voiceMedia = ref<MediaItem[]>([]);
const voiceFileInput = ref<HTMLInputElement | null>(null);

const openVoiceFilePicker = () => voiceFileInput.value?.click();

const onVoiceFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const src = URL.createObjectURL(file);
    voiceMedia.value.push({ id: ++nextId, src, file });
  }
  (event.target as HTMLInputElement).value = "";
};

const removeVoiceMedia = (id: number) => {
  const item = voiceMedia.value.find((m) => m.id === id);
  if (item) URL.revokeObjectURL(item.src);
  voiceMedia.value = voiceMedia.value.filter((m) => m.id !== id);
};

// ─── Audio recording ─────────────────────────────────────────────────────────
const isRecording = ref(false);
const isPlaying = ref(false);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref<string | null>(null);
const audioDuration = ref(0);
const recordingSeconds = ref(0);
const waveformBars = ref<number[]>(Array.from({ length: 42 }, () => 20));

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingInterval: ReturnType<typeof setInterval> | null = null;
let audioEl: HTMLAudioElement | null = null;
let animationFrame: number | null = null;
let analyser: AnalyserNode | null = null;

const formattedDuration = computed(() => {
  const s = isRecording.value ? recordingSeconds.value : audioDuration.value;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
});

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: "audio/webm" });
      if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
      audioUrl.value = URL.createObjectURL(audioBlob.value);
      audioDuration.value = recordingSeconds.value;
      showWaveform.value = true;
      stream.getTracks().forEach((t) => t.stop());
      audioCtx.close();
      analyser = null;
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };

    mediaRecorder.start();
    isRecording.value = true;
    recordingSeconds.value = 0;
    recordingInterval = setInterval(() => recordingSeconds.value++, 1000);
    animateWaveform();
  } catch {
    showToast("Microphone access denied", "error");
  }
};

const stopRecording = () => {
  mediaRecorder?.stop();
  isRecording.value = false;
  if (recordingInterval) clearInterval(recordingInterval);
};

const toggleRecord = () => {
  if (isRecording.value) stopRecording();
  else startRecording();
};

const toggleWaveformPlay = () => {
  if (!waveform.value) return;
  waveform.value.playPause();
};

const initWaveform = async () => {
  if (!waveformContainer.value) return;
  const module = await import("wavesurfer.js");
  const WaveSurfer = module.default;
  waveform.value = WaveSurfer.create({
    container: waveformContainer.value,
    waveColor: "#9CA3AF",
    progressColor: "#000066",
    cursorWidth: 0,
    barWidth: 2,
    barRadius: 2,
    height: 32,
    normalize: true,
  });
  waveform.value.on("play", () => {
    isWaveformPlaying.value = true;
  });
  waveform.value.on("pause", () => {
    isWaveformPlaying.value = false;
  });
  waveform.value.on("finish", () => {
    isWaveformPlaying.value = false;
  });
  if (audioUrl.value) {
    waveform.value.load(audioUrl.value);
  }
};

const animateWaveform = () => {
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  waveformBars.value = Array.from({ length: 42 }, (_, i) => {
    const idx = Math.floor((i / 42) * data.length);
    return Math.max(8, (data[idx] / 255) * 100);
  });
  animationFrame = requestAnimationFrame(animateWaveform);
};

const togglePlay = () => {
  if (!audioUrl.value) return;
  if (!audioEl) {
    audioEl = new Audio(audioUrl.value);
    audioEl.onended = () => {
      isPlaying.value = false;
    };
  }
  if (isPlaying.value) {
    audioEl.pause();
    isPlaying.value = false;
  } else {
    audioEl.play();
    isPlaying.value = true;
  }
};

const deleteRecording = () => {
  audioEl?.pause();
  audioEl = null;
  isPlaying.value = false;
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  audioUrl.value = null;
  audioBlob.value = null;
  audioDuration.value = 0;
  recordingSeconds.value = 0;
  waveformBars.value = Array.from({ length: 42 }, () => 20);
  showWaveform.value = false;
  isWaveformPlaying.value = false;
  waveform.value?.destroy();
  waveform.value = null;
};

// ─── Video tab ────────────────────────────────────────────────────────────────
const videoFile = ref<File | null>(null);
const videoPreviewUrl = ref<string | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);
const videoImageFiles = ref<MediaItem[]>([]);
const videoImageInput = ref<HTMLInputElement | null>(null);

const openVideoFilePicker = () => videoFileInput.value?.click();

const onVideoSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !file.type.startsWith("video/")) return;
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value);
  videoFile.value = file;
  videoPreviewUrl.value = URL.createObjectURL(file);
  (event.target as HTMLInputElement).value = "";
};

const removeVideo = () => {
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value);
  videoFile.value = null;
  videoPreviewUrl.value = null;
};

const openVideoImagePicker = () => videoImageInput.value?.click();

const onVideoImagesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const src = URL.createObjectURL(file);
    videoImageFiles.value.push({ id: ++nextId, src, file });
  }
  (event.target as HTMLInputElement).value = "";
};

const removeVideoImage = (id: number) => {
  const item = videoImageFiles.value.find((m) => m.id === id);
  if (item) URL.revokeObjectURL(item.src);
  videoImageFiles.value = videoImageFiles.value.filter((m) => m.id !== id);
};

// ─── Validation & Submit ──────────────────────────────────────────────────────
const validate = () => {
  const e: Record<string, string> = {};
  if (activeTab.value === "text") {
    if (!reviewText.value.trim()) e.reviewText = "Please write your review.";
  } else {
    if (!reviewTitle.value.trim()) e.reviewTitle = "Please add a title.";
    if (activeTab.value === "voice" && !audioBlob.value)
      e.audio = "Please record or upload audio.";
    if (activeTab.value === "video" && !videoFile.value)
      e.video = "Please upload or record a video.";
  }
  errors.value = e;
  return Object.keys(e).length === 0;
};

const showToast = (message: string, type: "success" | "error") => {
  toast.value = { message, type };
  setTimeout(() => (toast.value = null), 3500);
};

const submitLabel = computed(() =>
  activeTab.value === "video" ? "Tell Parrot" : "Share Review",
);

const toCamelCase = (str: string): string => {
  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0
        ? lower
        : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

const averageRating = computed(() => {
  if (!props.ratings || Object.keys(props.ratings).length === 0) return null;
  const values = Object.values(props.ratings)
    .map((r) => Number(r))
    .filter((r) => !isNaN(r) && r > 0);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
});

const validateUserInfo = (): boolean => {
  const e: Record<string, string> = {};
  if (!userFormData.value.firstName.trim())
    e.firstName = "First name is required.";
  if (!userFormData.value.lastName.trim())
    e.lastName = "Last name is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userFormData.value.email.trim()) e.email = "Email is required.";
  else if (!emailRegex.test(userFormData.value.email))
    e.email = "Please enter a valid email.";
  userFormErrors.value = e;
  return Object.keys(e).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  // Show user info modal instead of directly submitting
  userFormData.value.firstName = userInfo.firstName;
  userFormData.value.lastName = userInfo.lastName;
  userFormData.value.email = userInfo.email;
  showUserInfoModal.value = true;
};

const handleConfirmUserInfo = async () => {
  if (!validateUserInfo()) return;
  showUserInfoModal.value = false;
  try {
    // 1. Collect all files to upload
    const filesToUpload: File[] = [];
    const audioFile =
      activeTab.value === "voice" && audioBlob.value
        ? new File([audioBlob.value], "voice-review.webm", {
            type: "audio/webm",
          })
        : null;
    if (audioFile) filesToUpload.push(audioFile);

    textMedia.value.forEach((m) => {
      if (m.file) filesToUpload.push(m.file);
    });
    voiceMedia.value.forEach((m) => {
      if (m.file) filesToUpload.push(m.file);
    });
    videoImageFiles.value.forEach((m) => {
      if (m.file) filesToUpload.push(m.file);
    });
    if (videoFile.value) filesToUpload.push(videoFile.value);

    // 2. Upload all media files
    let uploadedUrls: string[] = [];
    if (filesToUpload.length > 0) {
      const uploadedResponses = await uploadMultiple(filesToUpload);
      uploadedUrls = uploadedResponses.map((r) => r.location);
    }

    // 3. Build files payload
    const filesPayload = uploadedUrls.map((url) => ({ url }));

    // 4. Compute overall rating
    const ratingValues = Object.values(props.ratings || {})
      .map(Number)
      .filter((r) => !isNaN(r) && r > 0);
    const overall = ratingValues.length
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : 0;

    // 5. Map category ratings to camelCase keys
    const ratingPayload: Record<string, number> = {};
    if (props.ratings) {
      for (const [cat, val] of Object.entries(props.ratings)) {
        const num = Number(val);
        if (isNaN(num) || num <= 0) continue;
        ratingPayload[toCamelCase(cat)] = num;
      }
    }

    // 6. Resolve product and employee IDs (already resolved from parent)
    const productIds = props.productIds;
    const employeeIds = props.employeeIds;

    // 7. Build payload for /review/public
    const payload = {
      businessId: props.businessId,
      firstName: userFormData.value.firstName,
      lastName: userFormData.value.lastName,
      email: userFormData.value.email,
      dateOfExperience: props.reviewDate,
      experienceSummary:
        activeTab.value === "text" ? reviewText.value : reviewTitle.value,
      rating: ratingPayload,
      files: filesPayload,
      productIds,
      employeeIds,
      mentions: [] as string[],
    };

    // 8. Submit JSON payload
    await submitReview(payload);

    showToast("Review submitted successfully!", "success");

    // 9. Success feedback
    if (overall) {
      successMessage.value = `You rated this business ${overall.toFixed(1)}/5 stars`;
    } else {
      successMessage.value = "Your review has been submitted!";
    }
    showSuccessModal.value = true;

    // 10. Reset form after delay
    setTimeout(() => {
      reviewText.value = "";
      reviewTitle.value = "";
      textMedia.value = [];
      voiceMedia.value = [];
      videoImageFiles.value = [];
      deleteRecording();
      removeVideo();
      showUserInfoModal.value = false;
    }, 3000);
  } catch (error) {
    console.error("Review submission error:", error);
    showToast("Submission failed. Please try again.", "error");
    showUserInfoModal.value = false;
  }
};

// ─── User info from token ───────────────────────────────────────────────────

const userInfo = {
  firstName: "",
  lastName: "",
  email: "",
};

// ─── Cleanup ──────────────────────────────────────────────────────────────────
onUnmounted(() => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value);
  textMedia.value.forEach((m) => URL.revokeObjectURL(m.src));
  voiceMedia.value.forEach((m) => URL.revokeObjectURL(m.src));
  videoImageFiles.value.forEach((m) => URL.revokeObjectURL(m.src));
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (recordingInterval) clearInterval(recordingInterval);
  waveform.value?.destroy();
});
</script>

<template>
  <div
    class="flex flex-col gap-5 bg-white rounded-xl border border-review-border p-5"
  >
    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toast"
        :class="[
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-[13px] font-medium shadow-lg text-white flex items-center gap-2',
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
        ]"
      >
        <svg
          v-if="toast.type === 'success'"
          viewBox="0 0 24 24"
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clip-rule="evenodd"
          />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Section heading -->
    <h2 class="text-[18px] font-medium text-review-text-mid">
      Choose how to share your review
    </h2>

    <!-- Tab switcher -->
    <div
      class="flex rounded-xl border border-review-border bg-review-tab-bg overflow-hidden"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        role="tab"
        :aria-selected="activeTab === tab.value"
        :aria-disabled="tab.value !== 'text'"
        class="flex-1 py-2.5 text-[14px] transition-all focus:outline-none"
        :class="[
          activeTab === tab.value
            ? 'bg-review-primary text-white font-bold'
            : 'text-review-text-muted font-medium hover:text-review-text-mid',
          tab.value !== 'text'
            ? 'opacity-60 hover:text-review-text-muted'
            : 'cursor-pointer',
        ]"
        :title="tab.value !== 'text' ? 'Available in Parrot app' : ''"
        @click="handleTabClick(tab.value)"
      >
        <span class="inline-flex items-center justify-center gap-2">
          {{ tab.label }}
          <span
            v-if="tab.value !== 'text'"
            class="rounded-full bg-review-primary/10 text-review-primary text-[10px] font-semibold px-2 py-0.5"
          >
            App
          </span>
        </span>
      </button>
    </div>
    <p class="mt-3 text-[12px] text-review-text-muted leading-relaxed">
      Only text reviews can be shared from the web. Voice and video reviews are
      available in the Parrot app for the best experience.
    </p>

    <!-- ── TEXT TAB ── -->
    <Transition name="fade-tab" mode="out-in">
      <div v-if="activeTab === 'text'" key="text" class="flex flex-col gap-4">
        <div
          class="bg-white rounded-xl border border-review-border p-4 flex flex-col gap-4"
        >
          <!-- Info banner -->
          <div class="flex items-start gap-3">
            <div
              class="w-6 h-6 rounded-full bg-review-orange flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-3 h-3 text-white"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-[12px] font-semibold text-review-text-dark">
                Share a helpful review
              </p>
              <p class="text-[11px] text-review-text-muted leading-relaxed">
                Your feedback helps businesses improve and helps other customers
                make better choices.
              </p>
            </div>
          </div>

          <!-- Textarea -->
          <textarea
            v-model="reviewText"
            placeholder="Write your review here..."
            rows="5"
            aria-label="Review text"
            :class="[
              'w-full text-[13px] text-review-text-dark placeholder-[#bfbfc1] resize-none focus:outline-none border rounded-2xl p-4 bg-review-tab-bg transition-colors shadow-sm',
              errors.reviewText
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#e0e0e0] focus:border-review-primary',
            ]"
          />
          <p class="text-[11px] text-review-text-muted mt-2">
            Optional: add images or a short review to help your feedback stand
            out.
          </p>
          <!-- Media row -->
          <div
            class="grid grid-cols-4 items-center gap-1.5 bg-review-tab-bg rounded-lg p-2"
          >
            <button
              class="h-[60px] border border-[#bfbfc1] rounded-lg flex flex-col items-center justify-center gap-1 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Add more media"
              @click="openTextFilePicker"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-5 h-5 text-review-text-muted"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span class="text-[11px] text-review-text-muted">Add more</span>
            </button>
            <div
              v-for="media in textMedia"
              :key="media.id"
              class="relative w-full h-[60px] rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
              @click="openPreview(textMedia, textMedia.indexOf(media), 'image')"
            >
              <img
                :src="media.src"
                alt="Review media"
                class="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
              <button
                class="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove media"
                @click.stop="removeTextMedia(media.id)"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="w-3 h-3 text-[#3b3b3f]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p v-if="errors.reviewText" class="text-[11px] text-red-500 -mt-1">
            {{ errors.reviewText }}
          </p>
        </div>

        <!-- Hidden file input -->
        <input
          ref="textFileInput"
          type="file"
          accept="image/*,video/*"
          multiple
          class="hidden"
          @change="onTextFilesSelected"
        />
      </div>

      <!-- ── VOICE NOTE TAB ── -->
      <div
        v-else-if="activeTab === 'voice'"
        key="voice"
        class="flex flex-col gap-4"
      >
        <!-- Title input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[18px] font-medium text-review-text-mid"
            >Title</label
          >
          <div
            :class="[
              'border rounded-xl px-4 py-3 bg-white transition-colors',
              errors.reviewTitle
                ? 'border-red-400'
                : 'border-[#bfbfc1] focus-within:border-review-primary',
            ]"
          >
            <input
              v-model="reviewTitle"
              type="text"
              placeholder="Give your voice review a title"
              aria-label="Voice review title"
              class="w-full text-[14px] text-review-text-dark placeholder-review-text-muted focus:outline-none bg-transparent"
            />
          </div>
          <p v-if="errors.reviewTitle" class="text-[11px] text-red-500">
            {{ errors.reviewTitle }}
          </p>
        </div>

        <div
          class="bg-white rounded-xl border border-review-border p-4 flex flex-col gap-5"
        >
          <!-- Info banner -->
          <div class="flex items-center gap-2">
            <div
              class="w-5 h-5 rounded-full bg-review-orange flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-3 h-3 text-white"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="text-[11px] text-[#00003e] leading-relaxed">
              Please share your honest review, both positive &amp; negative.
            </p>
          </div>

          <!-- Record button -->
          <div
            :class="[
              'border rounded-lg flex flex-col items-center justify-center gap-2 py-6 cursor-pointer transition-colors select-none',
              isRecording
                ? 'border-red-400 bg-red-50'
                : 'border-[#bfbfc1] hover:bg-gray-50',
            ]"
            role="button"
            tabindex="0"
            :aria-label="isRecording ? 'Stop recording' : 'Start recording'"
            @click="toggleRecord"
            @keydown.enter="toggleRecord"
            @keydown.space.prevent="toggleRecord"
          >
            <!-- Mic icon with pulse ring when recording -->
            <div class="relative flex items-center justify-center">
              <span
                v-if="isRecording"
                class="absolute inline-flex h-12 w-12 rounded-full bg-red-400 opacity-30 animate-ping"
              />
              <svg
                viewBox="0 0 24 24"
                :class="[
                  'w-8 h-8 transition-colors',
                  isRecording ? 'text-red-500' : 'text-[#000066]',
                ]"
                fill="currentColor"
              >
                <path
                  d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z"
                />
                <path
                  d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z"
                />
              </svg>
            </div>
            <p class="text-[12px] font-medium text-black">
              {{
                isRecording
                  ? `Recording… ${formattedDuration}`
                  : "Click to record audio"
              }}
            </p>
            <p v-if="isRecording" class="text-[11px] text-red-500">
              Tap again to stop
            </p>
          </div>

          <p v-if="errors.audio" class="text-[11px] text-red-500 -mt-3">
            {{ errors.audio }}
          </p>

          <!-- Hidden file input for voice gallery images -->
          <input
            ref="voiceFileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onVoiceFilesSelected"
          />

          <!-- Media gallery -->
          <div
            class="grid grid-cols-4 items-center gap-1.5 bg-review-tab-bg rounded-lg p-2"
          >
            <button
              class="h-[60px] border border-[#bfbfc1] rounded-lg flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Add more media"
              @click="openVoiceFilePicker"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-3 h-3 text-review-text-muted"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span class="text-[9px] text-review-text-muted">Add more</span>
            </button>
            <div
              v-for="media in voiceMedia"
              :key="media.id"
              class="relative h-[60px] rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
              @click="
                openPreview(voiceMedia, voiceMedia.indexOf(media), 'image')
              "
            >
              <img
                :src="media.src"
                alt="Media thumbnail"
                class="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
              <button
                class="absolute top-0.5 right-0.5 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center z-[50] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove media"
                @click.stop="removeVoiceMedia(media.id)"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="w-2.5 h-2.5 text-[#3b3b3f]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="audioUrl" class="flex justify-end mb-2">
          <button
            type="button"
            class="text-[12px] text-review-text-muted hover:text-review-primary transition-colors"
            @click="showWaveform = !showWaveform"
          >
            {{ showWaveform ? "Show Simple Bars" : "Show Waveform" }}
          </button>
        </div>

        <!-- Audio player (only when recording exists) -->
        <div
          v-if="audioUrl && showWaveform"
          class="flex items-center gap-3 bg-white rounded-xl border border-review-border px-4 py-3"
        >
          <button
            class="w-9 h-9 rounded-full bg-review-primary flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all active:scale-95"
            :aria-label="isWaveformPlaying ? 'Pause' : 'Play'"
            @click="toggleWaveformPlay"
          >
            <svg
              v-if="!isWaveformPlaying"
              viewBox="0 0 24 24"
              class="w-4 h-4 text-white ml-0.5"
              fill="currentColor"
            >
              <path
                d="M6.3 2.841A1.5 1.5 0 004 4.11v15.78a1.5 1.5 0 002.3 1.269l9.344-7.89a1.5 1.5 0 000-2.538L6.3 2.84z"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              class="w-4 h-4 text-white"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7-.75a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-1.25z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <div ref="waveformContainer" class="flex-1 h-8 overflow-hidden"></div>

          <span
            class="text-[12px] font-medium text-[#191815] flex-shrink-0 tabular-nums"
            >{{ formattedDuration }}</span
          >

          <button
            class="flex-shrink-0"
            aria-label="Delete recording"
            @click="deleteRecording"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-5 h-5 text-[#8c1523]"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 11-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div
          v-else-if="audioUrl"
          class="flex items-center gap-3 bg-white rounded-xl border border-review-border px-4 py-3"
        >
          <button
            class="w-9 h-9 rounded-full bg-review-primary flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all active:scale-95"
            :aria-label="isPlaying ? 'Pause' : 'Play'"
            @click="togglePlay"
          >
            <svg
              v-if="!isPlaying"
              viewBox="0 0 24 24"
              class="w-4 h-4 text-white ml-0.5"
              fill="currentColor"
            >
              <path
                d="M6.3 2.841A1.5 1.5 0 004 4.11v15.78a1.5 1.5 0 002.3 1.269l9.344-7.89a1.5 1.5 0 000-2.538L6.3 2.84z"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              class="w-4 h-4 text-white"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7-.75a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-1.25z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Waveform (live bars during recording, static after) -->
          <div class="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
            <div
              v-for="(bar, i) in waveformBars"
              :key="i"
              :class="[
                'flex-1 rounded-full min-w-[1.5px] transition-all duration-75',
                isRecording ? 'bg-red-400' : 'bg-review-primary/35',
              ]"
              :style="{ height: `${bar}%` }"
            />
          </div>

          <span
            class="text-[12px] font-medium text-[#191815] flex-shrink-0 tabular-nums"
            >{{ formattedDuration }}</span
          >

          <button
            class="flex-shrink-0"
            aria-label="Delete recording"
            @click="deleteRecording"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-5 h-5 text-[#8c1523]"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 11-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- ── VIDEO TAB ── -->
      <div
        v-else-if="activeTab === 'video'"
        key="video"
        class="flex flex-col gap-4"
      >
        <!-- Title input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[18px] font-medium text-review-text-mid"
            >Title</label
          >
          <div
            :class="[
              'border rounded-xl px-4 py-3 bg-white transition-colors',
              errors.reviewTitle
                ? 'border-red-400'
                : 'border-[#bfbfc1] focus-within:border-review-primary',
            ]"
          >
            <input
              v-model="reviewTitle"
              type="text"
              placeholder="Give your video review a title"
              aria-label="Video review title"
              class="w-full text-[14px] text-review-text-dark placeholder-review-text-muted focus:outline-none bg-transparent"
            />
          </div>
          <p v-if="errors.reviewTitle" class="text-[11px] text-red-500">
            {{ errors.reviewTitle }}
          </p>
        </div>

        <div
          class="bg-white rounded-xl border border-review-border p-4 flex flex-col gap-4"
        >
          <!-- Info banner -->
          <div class="flex items-center gap-2">
            <div
              class="w-5 h-5 rounded-full bg-review-orange flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-3 h-3 text-white"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="text-[11px] text-[#00003e] leading-relaxed">
              Please share your honest review, both positive &amp; negative.
            </p>
          </div>

          <!-- Hidden inputs -->
          <input
            ref="videoFileInput"
            type="file"
            accept="video/*"
            class="hidden"
            @change="onVideoSelected"
          />
          <input
            ref="videoImageInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onVideoImagesSelected"
          />

          <!-- Video preview OR upload area -->
          <div
            v-if="videoPreviewUrl"
            class="relative rounded-lg overflow-hidden bg-black cursor-pointer group"
            @click="openPreview([{ id: 1, src: videoPreviewUrl }], 0, 'video')"
          >
            <video
              :src="videoPreviewUrl"
              class="w-full max-h-[200px] object-contain group-hover:opacity-80 transition-opacity"
            />
            <button
              class="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label="Remove video"
              @click.stop="removeVideo"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-4 h-4 text-[#3b3b3f]"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            v-else
            :class="[
              'border rounded-lg flex flex-col items-center justify-center gap-2.5 py-7 cursor-pointer transition-colors',
              errors.video
                ? 'border-red-400 bg-red-50'
                : 'border-[#bfbfc1] hover:bg-gray-50',
            ]"
            role="button"
            tabindex="0"
            aria-label="Click to upload a video"
            @click="openVideoFilePicker"
            @keydown.enter="openVideoFilePicker"
            @keydown.space.prevent="openVideoFilePicker"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-9 h-9 text-[#000066]"
              fill="currentColor"
            >
              <path
                d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z"
              />
            </svg>
            <p class="text-[12px] font-medium text-black">
              Click to upload a video
            </p>
          </div>

          <p v-if="errors.video" class="text-[11px] text-red-500 -mt-2">
            {{ errors.video }}
          </p>

          <!-- Media type icons (image upload) -->
          <div class="flex items-center gap-3">
            <button
              aria-label="Upload video"
              class="text-black hover:opacity-70 transition-opacity"
              @click="openVideoFilePicker"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-5 h-[14px]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </button>
          </div>

          <!-- Image previews from video tab -->
          <div
            class="grid grid-cols-4 items-center gap-1.5 bg-review-tab-bg rounded-lg p-2"
          >
            <button
              class="h-[60px] border border-[#bfbfc1] rounded-lg flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Add more media"
              @click="openVideoImagePicker"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-3 h-3 text-review-text-muted"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span class="text-[9px] text-review-text-muted">Add more</span>
            </button>
            <div
              v-for="(media, idx) in videoImageFiles"
              :key="media.id"
              class="relative w-full h-[60px] rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
              @click="openPreview(videoImageFiles, idx, 'image')"
            >
              <img
                :src="media.src"
                alt="Media preview"
                class="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
              <button
                class="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove image"
                @click.stop="removeVideoImage(media.id)"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="w-3 h-3 text-[#3b3b3f]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
  <!-- Submit button -->
  <button
    :disabled="isSubmittingReview"
    :class="[
      'w-full mt-5 py-3.5 text-white text-[14px] font-medium rounded-full transition-all shadow-lg shadow-review-primary/20',
      isSubmittingReview
        ? 'bg-review-primary/60 cursor-not-allowed'
        : 'bg-review-primary hover:brightness-110 active:scale-[0.98]',
    ]"
    @click="handleSubmit"
  >
    <span
      v-if="isSubmittingReview"
      class="flex items-center justify-center gap-2"
    >
      <svg
        class="animate-spin w-4 h-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Submitting…
    </span>
    <span v-else>{{ submitLabel }}</span>
  </button>

  <!-- Preview Modal -->
  <Transition name="modal">
    <div
      v-if="showPreview && currentPreviewItem"
      class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      @click="closePreview"
      @keydown.escape="closePreview"
    >
      <div class="relative w-full max-w-2xl" @click.stop>
        <!-- Close button -->
        <button
          class="absolute -top-10 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          aria-label="Close preview"
          @click="closePreview"
        >
          <svg
            viewBox="0 0 24 24"
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Image Preview -->
        <img
          v-if="previewType === 'image'"
          :src="currentPreviewItem.src"
          :alt="`Preview ${previewIndex + 1}`"
          class="w-full max-h-[70vh] object-contain rounded-lg"
        />

        <!-- Video Preview -->
        <video
          v-else-if="previewType === 'video'"
          :src="currentPreviewItem.src"
          controls
          class="w-full max-h-[70vh] object-contain rounded-lg bg-black"
        />

        <!-- Navigation -->
        <div
          v-if="previewItems.length > 1"
          class="flex items-center justify-between mt-4"
        >
          <button
            :disabled="previewIndex === 0"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-[13px] font-medium transition-colors"
            @click="goToPrevPreview"
          >
            Previous
          </button>
          <span class="text-white text-[13px]">
            {{ previewIndex + 1 }} / {{ previewItems.length }}
          </span>
          <button
            :disabled="previewIndex === previewItems.length - 1"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-[13px] font-medium transition-colors"
            @click="goToNextPreview"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Download Prompt Modal -->
  <Transition name="modal">
    <div
      v-if="showDownloadPrompt"
      class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      @click="showDownloadPrompt = false"
    >
      <div
        class="bg-white rounded-2xl max-w-sm w-full p-6 flex flex-col gap-4"
        @click.stop
      >
        <div class="flex flex-col gap-2">
          <h3 class="text-[18px] font-bold text-review-text-dark">
            {{
              downloadPromptFeature === "voice"
                ? "Voice Notes Available in App"
                : "Video Reviews Available in App"
            }}
          </h3>
          <p class="text-[14px] text-review-text-muted">
            {{
              downloadPromptFeature === "voice"
                ? "Record and share your voice reviews directly through the Parrot app for a seamless experience."
                : "Create and share video reviews directly through the Parrot app for a seamless experience."
            }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 py-3 text-[14px] font-medium text-review-primary border border-review-primary rounded-lg hover:bg-review-primary/5 transition-colors"
            @click="showDownloadPrompt = false"
          >
            Continue with Text
          </button>
          <button
            class="flex-1 py-3 text-[14px] font-medium text-white bg-review-primary rounded-lg hover:brightness-110 transition-all active:scale-[0.98]"
            @click="handleDownloadApp"
          >
            Download App
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Success Modal -->
  <Transition name="modal">
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px)"
     
    >
      <Transition name="modal-card" appear>
        <div
          v-if="showSuccessModal"
          class="relative w-full max-w-md overflow-hidden rounded-[20px]"
          style="
            background: var(--color-background-primary, #fff);
            border: 0.5px solid rgba(0, 0, 0, 0.12);
            box-shadow: 0 24px 48px -8px rgba(0, 0, 0, 0.18);
          "
          @click.stop
        >
          <div class="flex flex-col items-center gap-6 px-7 pt-8 pb-7">
            <!-- Icon -->
            <div
              class="relative w-[72px] h-[72px] flex items-center justify-center"
            >
              <div
                class="absolute inset-0 rounded-full"
                style="background: #fff7ed; border: 0.5px solid #fed7aa"
              ></div>
              <div
                class="absolute rounded-full"
                style="
                  inset: -6px;
                  border: 1.5px solid #fdba74;
                  opacity: 0.4;
                  border-radius: 9999px;
                "
              ></div>
              <svg
                viewBox="0 0 24 24"
                class="w-7 h-7 relative"
                fill="none"
                stroke="#f97316"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <!-- Title & message -->
            <div class="flex flex-col gap-1.5 text-center">
              <h3
                class="text-[18px] font-medium tracking-tight"
                style="color: var(--color-text-primary, #111827)"
              >
                Thanks For Sharing Your Experience
              </h3>
              <p
                class="text-[13px] leading-relaxed"
                style="color: var(--color-text-secondary, #6b7280)"
              >
                Login/Create an account to track and manage your review
              </p>
            </div>

            <!-- Star rating display -->
            <div
              v-if="averageRating"
              class="w-full rounded-xl px-5 py-4 flex flex-col items-center gap-2.5"
              style="background: var(--color-background-secondary, #f9fafb)"
            >
              <div class="flex gap-1">
                <template v-for="i in 5" :key="i">
                  <svg
                    viewBox="0 0 24 24"
                    class="w-5 h-5"
                    :fill="i <= Math.round(averageRating) ? '#f97316' : 'none'"
                    :stroke="
                      i <= Math.round(averageRating) ? '#f97316' : '#d1d5db'
                    "
                    stroke-width="1.5"
                  >
                    <path
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </template>
              </div>
              <p
                class="text-[22px] font-medium leading-none"
                style="color: var(--color-text-primary, #111827)"
              >
                {{ averageRating.toFixed(1) }}
                <span
                  class="text-[13px] font-normal"
                  style="color: var(--color-text-secondary, #6b7280)"
                  >/ 5</span
                >
              </p>
              <p
                class="text-[12px]"
                style="color: var(--color-text-tertiary, #9ca3af)"
              >
                Based on your review ratings
              </p>
            </div>

            <!-- Divider -->
            <div
              class="w-full h-px"
              style="background: var(--color-border-tertiary, #f3f4f6)"
            ></div>

            <!-- App CTA Section -->
            <div
              class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
            >
              <h3 class="text-sm font-bold text-gray-900 mb-2">
                Get More Features
              </h3>
              <p class="text-xs text-gray-600 mb-3 leading-relaxed">
                Login/Create an account in the Parrot app to record voice and video
                reviews, track your reviews, and earn rewards.
              </p>
              <div class="flex gap-2">
                <a
                  href="https://apps.apple.com/us/app/parrot-customer-reviews-app/id6476291372"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-xs font-medium"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"/></svg>
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.zacrac.parrot"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-xs font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m3.637 3.434l8.74 8.571l-8.675 8.65a2.1 2.1 0 0 1-.326-.613a2.5 2.5 0 0 1 0-.755V4.567c-.026-.395.065-.79.26-1.133m12.506 4.833l-2.853 2.826L4.653 2.6c.28-.097.58-.124.873-.078c.46.126.899.32 1.302.573l7.816 4.325c.508.273 1.003.56 1.498.847M13.29 12.93l2.839 2.788l-2.058 1.146l-6.279 3.49c-.52.287-1.042.561-1.55.874a1.8 1.8 0 0 1-1.472.195zm7.36-.925a1.92 1.92 0 0 1-.99 1.72l-2.346 1.302l-3.087-3.022l3.1-3.074c.795.443 1.577.886 2.358 1.303a1.89 1.89 0 0 1 .964 1.771"/></svg>
                  Play Store
                </a>
              </div>
            </div>

            <!-- Divider -->
            <div
              class="w-full h-px"
              style="background: var(--color-border-tertiary, #f3f4f6)"
            ></div>

          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- User Info Modal -->
  <Transition name="modal">
    <div
      v-if="showUserInfoModal"
      class="fixed inset-0 z-[101] bg-black/50 flex items-center justify-center p-4"
      @click="showUserInfoModal = false"
    >
      <Transition name="modal-card" appear>
        <div
          v-if="showUserInfoModal"
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          @click.stop
        >
         
          <!-- Form content -->
          <div class="px-6 py-6">
            <div class="flex flex-col gap-4 mb-6 text-gray-900">
              <!-- First Name -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700"
                  >First Name *</label
                >
                <input
                  v-model="userFormData.firstName"
                  type="text"
                  placeholder="John"
                  class="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-review-primary focus:ring-2 focus:ring-review-primary/20 transition-all bg-gray-50"
                  :class="
                    userFormErrors.firstName
                      ? 'border-red-400 bg-red-50 focus:ring-red-100'
                      : ''
                  "
                />
                <p
                  v-if="userFormErrors.firstName"
                  class="text-xs text-red-600 font-medium"
                >
                  {{ userFormErrors.firstName }}
                </p>
              </div>

              <!-- Last Name -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700"
                  >Last Name *</label
                >
                <input
                  v-model="userFormData.lastName"
                  type="text"
                  placeholder="Doe"
                  class="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-review-primary focus:ring-2 focus:ring-review-primary/20 transition-all bg-gray-50"
                  :class="
                    userFormErrors.lastName
                      ? 'border-red-400 bg-red-50 focus:ring-red-100'
                      : ''
                  "
                />
                <p
                  v-if="userFormErrors.lastName"
                  class="text-xs text-red-600 font-medium"
                >
                  {{ userFormErrors.lastName }}
                </p>
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700"
                  >Email Address *</label
                >
                <input
                  v-model="userFormData.email"
                  type="email"
                  placeholder="john@example.com"
                  class="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-review-primary focus:ring-2 focus:ring-review-primary/20 transition-all bg-gray-50"
                  :class="
                    userFormErrors.email
                      ? 'border-red-400 bg-red-50 focus:ring-red-100'
                      : ''
                  "
                />
                <p
                  v-if="userFormErrors.email"
                  class="text-xs text-red-600 font-medium"
                >
                  {{ userFormErrors.email }}
                </p>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-200 my-6"></div>

           
            <!-- Actions -->
            <div class="flex gap-3">
              <button
                class="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                @click="showUserInfoModal = false"
              >
                Cancel
              </button>
              <button
                class="flex-1 px-4 py-2.5 rounded-full bg-review-primary text-white text-sm font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="isSubmittingReview"
                @click="handleConfirmUserInfo"
              >
                <span
                  v-if="isSubmittingReview"
                  class="flex items-center justify-center gap-2"
                >
                  <svg
                    class="animate-spin w-4 h-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Submitting…
                </span>
                <span v-else>Submit Review</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-tab-enter-active,
.fade-tab-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-tab-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-tab-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from :deep(*) {
  transform: scale(0.95);
}
.modal-leave-to :deep(*) {
  transform: scale(0.95);
}

/* Backdrop fade */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Card spring-in */
.modal-card-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.modal-card-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(12px);
}
.modal-card-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(6px);
}
</style>
