<script setup lang="ts">
// ─── Types ───────────────────────────────────────────────────────────────────
type ShareMode = "text" | "voice" | "video";

interface MediaItem {
  id: number;
  src: string;
  file?: File;
}

// ─── Tab state ───────────────────────────────────────────────────────────────
const activeTab = ref<ShareMode>("text");
const tabs: { value: ShareMode; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "voice", label: "Voice Note" },
  { value: "video", label: "Video" },
];

// ─── Form state ──────────────────────────────────────────────────────────────
const reviewText = ref("");
const reviewTitle = ref("");
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
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

const handleSubmit = async () => {
  if (!validate()) return;
  isSubmitting.value = true;
  try {
    // Build payload — swap with your real API call
    const formData = new FormData();
    formData.append("mode", activeTab.value);
    if (activeTab.value === "text") {
      formData.append("review", reviewText.value);
      textMedia.value.forEach(
        (m, i) => m.file && formData.append(`media_${i}`, m.file),
      );
    } else if (activeTab.value === "voice") {
      formData.append("title", reviewTitle.value);
      if (audioBlob.value)
        formData.append("audio", audioBlob.value, "voice-review.webm");
      voiceMedia.value.forEach(
        (m, i) => m.file && formData.append(`media_${i}`, m.file),
      );
    } else {
      formData.append("title", reviewTitle.value);
      if (videoFile.value) formData.append("video", videoFile.value);
      videoImageFiles.value.forEach(
        (m, i) => m.file && formData.append(`image_${i}`, m.file),
      );
    }

    // Simulate API call
    await new Promise((r) => setTimeout(r, 900));
    showToast("Review submitted successfully!", "success");
    // Reset
    reviewText.value = "";
    reviewTitle.value = "";
    textMedia.value = [];
    voiceMedia.value = [];
    videoImageFiles.value = [];
    deleteRecording();
    removeVideo();
  } catch {
    showToast("Submission failed. Please try again.", "error");
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for audioUrl and showWaveform changes to init/destroy WaveSurfer
watch([audioUrl, showWaveform], async ([url, show]) => {
  if (url && show) {
    await nextTick();
    if (!waveform.value && waveformContainer.value) {
      initWaveform();
    } else if (waveform.value) {
      waveform.value.load(url);
    }
  } else if (!show && waveform.value) {
    waveform.value.destroy();
    waveform.value = null;
    isWaveformPlaying.value = false;
  }
});

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
        class="flex-1 py-2.5 text-[14px] transition-all focus:outline-none"
        :class="
          activeTab === tab.value
            ? 'bg-review-primary text-white font-bold'
            : 'text-review-text-muted font-medium hover:text-review-text-mid'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── TEXT TAB ── -->
    <Transition name="fade-tab" mode="out-in">
      <div v-if="activeTab === 'text'" key="text" class="flex flex-col gap-4">
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

          <!-- Textarea -->
          <textarea
            v-model="reviewText"
            placeholder="Write your review here..."
            rows="5"
            aria-label="Review text"
            :class="[
              'w-full text-[13px] text-review-text-dark placeholder-[#bfbfc1] resize-none focus:outline-none border rounded-lg p-3 bg-transparent transition-colors',
              errors.reviewText
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#e0e0e0] focus:border-review-primary',
            ]"
          />
          <p v-if="errors.reviewText" class="text-[11px] text-red-500 -mt-2">
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
    :disabled="isSubmitting"
    :class="[
      'w-full mt-5 py-3.5 text-white text-[14px] font-medium rounded-full transition-all',
      isSubmitting
        ? 'bg-review-primary/60 cursor-not-allowed'
        : 'bg-review-primary hover:brightness-110 active:scale-[0.98]',
    ]"
    @click="handleSubmit"
  >
    <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
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
</style>
