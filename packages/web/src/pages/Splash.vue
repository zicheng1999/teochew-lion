<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

defineProps({
  message: {
    type: String,
    default: 'Application is loading...',
  },
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value <= 600);
const loadingSize = computed(() => (isMobile.value ? 36 : 42));
</script>

<template>
  <div
    style="
      justify-content: center;
      align-items: center;
      display: flex;

      /* position the div in center */
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    "
  >
    <span
      style="white-space: nowrap; padding-right: 16px; font-weight: bold"
      :style="{
        fontSize: width <= 600 ? 'small' : 'medium',
      }"
      >{{ message }}</span
    >
    <svg
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      :width="loadingSize"
      :height="loadingSize"
      stroke="#1976D2"
    >
      <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="3">
          <circle stroke-opacity=".50" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  </div>
</template>
