<script setup lang="ts">
import Day from 'dayjs';
import { computed, PropType } from 'vue';
import { DateRange } from '../type';

interface DateOption {
  label: string;
  value: Date;
  disabled?: boolean;
}

const props = defineProps({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Object as PropType<Date | DateRange>,
    required: true,
  },
  hoveringDate: {
    type: Date,
    default: undefined,
  },
  selecting: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits<{
  (event: 'select', v: Date): void;
  (event: 'enter'): void;
  (event: 'leave'): void;
  (event: 'hover', v: Date): void;
}>();

const options = computed<DateOption[]>(() => {
  const { year, month } = props;
  const v = Day().year(year).month(month);
  const totalDays = v.daysInMonth();
  let days: DateOption[] = Array.from({ length: totalDays }, (_, i) => ({
    label: `${i + 1}`,
    value: v.startOf('month').add(i, 'day').toDate(),
  }));

  const padStart = v.startOf('month').day();
  if (padStart > 0) {
    const previousMonth = v.subtract(1, 'month').daysInMonth();
    const previousMonthStart = v.subtract(1, 'month').startOf('month');
    const previousMonthOptions = Array.from(Array(previousMonth)).map(
      (_, index) => {
        return {
          label: `${index + 1}`,
          value: previousMonthStart.add(index, 'days').toDate(),
          disabled: true,
        } as DateOption;
      }
    );
    days = [
      ...previousMonthOptions.slice(
        previousMonthOptions.length - padStart,
        previousMonthOptions.length
      ),
      ...days,
    ];
  }

  const padEnd = 6 - v.endOf('month').day();
  if (padEnd > 0) {
    const nextMonth = v.add(1, 'month').daysInMonth();
    const nextMonthStart = v.add(1, 'month').startOf('month');
    const nextMonthOptions = Array.from(Array(nextMonth)).map((_, index) => {
      return {
        label: `${index + 1}`,
        value: nextMonthStart.add(index, 'days').toDate(),
        disabled: true,
      } as DateOption;
    });
    days = [...days, ...nextMonthOptions.slice(0, padEnd)];
  }

  return days;
});

const dayLabels = computed(() => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
});

function getDateClass(date: DateOption) {
  if (date.disabled) return ['disabled'];
  const res: string[] = [];
  const hoveringDay =
    props.selecting && !!props.hoveringDate ? Day(props.hoveringDate) : null;
  if (isSelected(date.value) || hoveringDay?.isSame(date.value))
    res.push('selected');
  const overlay = getOverlay(date.value);
  if (overlay !== 'none') {
    res.push('overlay');
    res.push(`overlay-${overlay}`);
  }
  if (getHovering(date.value)) {
    res.push('hovering');
  }
  return res.join(' ');
}

function isSelected(date: Date) {
  const format = 'DD/MM/YYYY';
  const formattedDate = Day(date).format(format);
  const values =
    props.modelValue instanceof Date
      ? [props.modelValue]
      : [props.modelValue.start, props.modelValue.end];
  return values.some((v) => Day(v).format(format) === formattedDate);
}

function getOverlay(date: Date): 'none' | 'left' | 'right' | 'both' {
  if (props.modelValue instanceof Date) return 'none';
  const v = Day(date);
  const start = Day(props.modelValue.start);
  const end = props.modelValue.end ? Day(props.modelValue.end) : null;
  if (end && !start.isSame(end, 'days')) {
    if (v.isSame(start, 'day')) return 'right';
    if (v.isSame(end, 'day')) return 'left';
    if (v.isBetween(start, end, 'day', '[]')) return 'both';
  }

  if (
    props.selecting &&
    props.hoveringDate &&
    !start.isSame(props.hoveringDate, 'days')
  ) {
    const hovering = Day(props.hoveringDate);
    if (v.isBetween(start, hovering, 'day', '()')) return 'both';
    const startAfterHovering = hovering.isBefore(start);
    if (v.isSame(start)) return startAfterHovering ? 'left' : 'right';
    if (v.isSame(hovering)) return startAfterHovering ? 'right' : 'left';
  }
  return 'none';
}

function getHovering(date: Date): boolean {
  if (
    !props.selecting ||
    !props.hoveringDate ||
    props.modelValue instanceof Date
  )
    return false;
  return Day(date).isBetween(
    props.modelValue.start,
    props.hoveringDate,
    'day',
    '()'
  );
}

function onSelect(date: DateOption) {
  if (date.disabled) return;
  emits('select', Day(date.value).startOf('day').toDate());
}

function onHover(date: DateOption) {
  if (date.disabled) return;
  emits('hover', date.value);
}
</script>

<template>
  <div>
    <div class="row q-mb-sm">
      <div
        v-for="(label, index) in dayLabels"
        :key="index"
        class="col text-center text-fsecondary"
      >
        {{ label }}
      </div>
    </div>
    <div
      class="calendar-container"
      @mouseenter="() => emits('enter')"
      @mouseleave="() => emits('leave')"
    >
      <div
        v-for="(option, index) in options"
        :key="index"
        :class="getDateClass(option)"
        class="option"
        @click="() => onSelect(option)"
        @mouseover="() => onHover(option)"
      >
        <div class="option-value">
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import "src/styles/color"
$indicator-size: 28px

.calendar-container
  display: grid
  row-gap: 4px
  grid-template-columns: auto auto auto auto auto auto auto

  .option
    position: relative
    min-width: 40px
    min-height: 36px
    display: flex
    justify-content: center
    align-items: center

    &:hover
      cursor: pointer

    &.hovering:before
      content: ""
      position: absolute
      left: 0
      width: 100%
      height: 100%
      background: $primary-1

    &.selected
      .option-value
        color: white

    &.selected:after
      content: ""
      position: absolute
      background: $primary-3
      height: $indicator-size
      width: $indicator-size
      border-radius: 50%

  .option.overlay:before
    content: ""
    position: absolute
    left: 0
    width: 100%
    height: 100%
    background: $primary-1

  .option.overlay-left:before
    width: 96%
    border-radius: 0 $indicator-size $indicator-size 0

  .option.overlay-right:before
    width: 96%
    left: 4%
    border-radius: $indicator-size 0 0 $indicator-size

  .option-value
    z-index: 2
</style>
