<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<Date>,
    required: true,
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', date: Date): void;
}>();

const currentMonth = computed(() => props.modelValue.getMonth());
const startDate = dayjs(new Date()).startOf('year');

function selectMonth(month: number) {
  emits('update:model-value', dayjs(props.modelValue).month(month).toDate());
}
</script>

<template>
  <div class="calendar-month-grid">
    <div
      v-for="i in 12"
      :key="i"
      :class="currentMonth === i - 1 ? 'text-primary' : ''"
      class="cursor-pointer br-sm q-px-lg q-py-sm"
      @click="selectMonth(i - 1)"
    >
      {{ startDate.add(i - 1, 'months').format('MMM') }}
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import "src/styles/color"

.calendar-month-grid
  display: grid
  grid-template-columns: auto auto auto
  column-gap: 2rem
  row-gap: 1rem

  div
    display: grid
    place-items: center
</style>
