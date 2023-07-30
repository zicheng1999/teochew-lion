<script setup lang="ts">
import Day from 'dayjs';
import { useResponsive } from 'src/composable';
import { computed, PropType, reactive, ref, onMounted } from 'vue';
import { IconButton } from '..';
import { DatePickerData, DateRange } from '../type';
import CalendarGrid from './CalendarGrid.vue';
import CalendarMonth from './CalendarMonth.vue';

const props = defineProps({
  consecutiveMonth: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object as PropType<Date | DateRange>,
    required: true,
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', v: DatePickerData): void;
}>();

const { screen } = useResponsive();

const selecting = ref(false);
const showMonth = ref<'current' | 'next' | null>(null);
const hoveringDate = ref<Date>();
const view = ref(new Date());
const state = reactive<{
  start: Date;
  end: null | Date;
}>({
  start: new Date(),
  end: new Date(),
});

const currentView = computed(() => Day(view.value));
const nextView = computed(() => Day(view.value).add(1, 'month'));

function selectMonth(type: typeof showMonth.value, date: Date) {
  const month = date.getMonth();
  view.value = Day(view.value)
    .month(Math.max(type === 'current' ? month : month - 1))
    .toDate();
  showMonth.value = null;
}

function selectDate(date: Date) {
  if (props.modelValue instanceof Date) {
    emits('update:model-value', Day(date).startOf('day').toDate());
  } else if (selecting.value) {
    const res =
      date > state.start
        ? {
            start: Day(state.start).startOf('day').toDate(),
            end: Day(date).endOf('day').toDate(),
          }
        : {
            start: Day(date).startOf('day').toDate(),
            end: Day(state.start).endOf('day').toDate(),
          };
    state.start = res.start;
    state.end = res.end;
    selecting.value = false;
    hoveringDate.value = undefined;
    emits('update:model-value', res);
  } else {
    selecting.value = true;
    state.start = date;
    state.end = null;
  }
}

function previousYear() {
  view.value = Day(view.value).subtract(1, 'year').toDate();
}

function previousMonth() {
  view.value = Day(view.value).subtract(1, 'month').toDate();
}

function nextYear() {
  view.value = Day(view.value).add(1, 'year').toDate();
}

function nextMonth() {
  view.value = Day(view.value).add(1, 'month').toDate();
}

function hoverDate(date?: Date) {
  hoveringDate.value = date;
}

onMounted(() => {
  if (props.modelValue instanceof Date) {
    const date = Day(props.modelValue);
    view.value = date.toDate();
    state.start = date.startOf('day').toDate();
    state.end = date.endOf('day').toDate();
  } else {
    const start = Day(props.modelValue.start);
    const end = Day(props.modelValue.end);
    view.value = start.toDate();
    state.start = start.startOf('day').toDate();
    state.end = end.endOf('day').toDate();
  }
});
</script>

<template>
  <div class="column bg-white">
    <div
      class="row items-center q-pa-sm"
      :class="{ 'justify-between': !consecutiveMonth }"
    >
      <slot name="header">
        <div class="row">
          <icon-button
            icon="keyboard_double_arrow_left"
            @click="previousYear"
          />
          <icon-button icon="chevron_left" @click="previousMonth" />
        </div>
        <div
          class="q-px-lg cursor-pointer"
          :class="{ 'col text-center': screen.lt.sm }"
          @click="() => (showMonth = 'current')"
        >
          {{ currentView.format('YYYY-MM') }}
        </div>
        <q-space v-if="consecutiveMonth" class="gt-xs" />
        <div
          v-if="consecutiveMonth"
          class="q-px-lg gt-xs"
          @click="() => (showMonth = 'next')"
        >
          {{ nextView.format('YYYY-MM') }}
        </div>
        <div class="row">
          <icon-button icon="chevron_right" @click="nextMonth" />
          <icon-button icon="keyboard_double_arrow_right" @click="nextYear" />
        </div>
      </slot>
    </div>
    <q-separator />
    <div class="row q-gutter-x-lg q-pa-sm">
      <calendar-month
        v-if="showMonth === 'current'"
        :model-value="currentView.toDate()"
        class="col"
        @update:model-value="(v) => selectMonth('current', v)"
      />
      <calendar-grid
        v-else
        :model-value="state"
        :year="currentView.year()"
        :month="currentView.month()"
        :hovering-date="hoveringDate"
        :selecting="selecting"
        class="col"
        @select="selectDate"
        @hover="hoverDate"
        @leave="() => hoverDate()"
      />

      <template v-if="consecutiveMonth">
        <calendar-month
          v-if="showMonth === 'next'"
          :model-value="nextView.toDate()"
          class="col"
          @update:model-value="(v) => selectMonth('next', v)"
        />
        <calendar-grid
          v-else
          :model-value="state"
          :year="nextView.year()"
          :month="nextView.month()"
          :hovering-date="hoveringDate"
          :selecting="selecting"
          class="col gt-xs"
          @select="selectDate"
          @hover="hoverDate"
          @leave="() => hoverDate()"
        />
      </template>
    </div>
  </div>
</template>
