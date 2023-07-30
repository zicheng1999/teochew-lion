<script setup lang="ts">
import { PropType, ref } from 'vue';
import { useFormChild } from 'quasar';
import VuePdfEmbed from 'vue-pdf-embed';
import { notify } from 'src/plugins';
import { arrowLeftIcon, arrowRightIcon, uploadIcon } from 'src/assets/icons';
import FilePicker from './FilePicker.vue';

const props = defineProps({
  pdf: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  canUpdate: {
    type: Boolean,
    required: true,
  },
  size: {
    type: Object as PropType<{
      width?: string;
      height?: string;
    }>,
    default: undefined,
  },
  required: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits<{
  (event: 'upload', v: File): void;
}>();

const errorMsg = 'Please select a file';
const isError = ref(false);
const isPdfLoading = ref(true);
const totalPages = ref(0);
const currentPage = ref(1);

useFormChild({
  validate,
  resetValidation,
  requiresQForm: true,
});

function resetValidation() {
  isError.value = false;
}

async function validate() {
  if (!props.pdf && !!props.required) {
    isError.value = true;
    notify.failed(`${props.name} is required`);
    return false;
  }
  return true;
}

function onUpload(files: File[]) {
  isError.value = false;
  emits('upload', files[0]);
}

function onLoaded(pdfProxy: { numPages: number }) {
  isPdfLoading.value = false;
  totalPages.value = pdfProxy.numPages;
  if (pdfProxy.numPages > 0) {
    currentPage.value = 1;
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
}
</script>

<template>
  <div>
    <div
      class="row items-center q-gutter-x-md"
      :class="{ 'q-mb-md': !!pdf || isError }"
    >
      <div class="col">{{ name }} (PDF)</div>
      <div v-if="canUpdate">
        <file-picker
          :can-replace="false"
          :extensions="['.pdf']"
          :has-content="false"
          :show-hover="false"
          @input="onUpload"
        >
          <secondary-button label="Upload" color="primary" :icon="uploadIcon" />
        </file-picker>
      </div>
    </div>
    <div
      v-if="pdf"
      class="row"
      :style="`width: ${size?.width}; height: ${size?.height}`"
    >
      <div class="relative-position fit bordered overflow-hidden">
        <div
          v-if="isPdfLoading"
          class="absolute fit row justify-center items-center"
        >
          <q-spinner color="primary" size="3em" :thickness="2" />
        </div>
        <div :class="{ invisible: isPdfLoading }" class="relative-position fit">
          <vue-pdf-embed
            :source="pdf"
            :disable-text-layer="true"
            :disable-annotation-layer="true"
            :page="currentPage"
            @loaded="onLoaded"
          />

          <div style="position: absolute; right: 16px; top: 16px">
            <slot name="top-right" />
          </div>
        </div>
        <div :class="{ invisible: isPdfLoading }" class="pdf-viewer-name">
          <div class="row justify-between items-center">
            <flat-button
              :icon="arrowLeftIcon"
              padding="none"
              @click="previousPage"
            />
            <div class="t-system">{{ currentPage }} / {{ totalPages }}</div>
            <flat-button
              :icon="arrowRightIcon"
              padding="none"
              @click="nextPage"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isError" class="text-negative t-system">
      {{ errorMsg }}
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import 'src/styles/color'
.pdf-viewer-name
  position: absolute
  width: 100%
  padding: 8px 16px
  bottom: 0
  text-align: center
  border-top: 1px solid $utility-divider
  background: $utility-bg

.iframe
  overflow: hidden
</style>
