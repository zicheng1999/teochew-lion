<script setup lang="ts">
import Day from 'dayjs';
import { QPopupProxy } from 'quasar';
import { ref, computed } from 'vue';
import ColumnRoller from './components/ColumnRoller.vue';

const props = defineProps({
  modelValue: {
    type: Date,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', v: Date): void;
}>();

const popup = ref<QPopupProxy>();

const hourKey = 'hour';
const minuteKey = 'minute';
const periodKey = 'period';

// [hours, minutes, period]
const options = {
  [hourKey]: {
    options: Array.from(Array(12)).map((_, i) => {
      const v = i + 1;
      return {
        label: `${v.toString().padStart(2, '0')}`,
        value: v,
      };
    }),
  },
  [minuteKey]: {
    options: Array.from(Array(60)).map((_, i) => {
      return {
        label: `${i.toString().padStart(2, '0')}`,
        value: i,
      };
    }),
  },
  [periodKey]: {
    options: ['AM', 'PM'].map((v) => ({
      label: v,
      value: v,
    })),
  },
};

const initialValue = computed(() => {
  const [hour, minute, period] = Day(props.modelValue)
    .format('hh:mm:A')
    .split(':');
  return {
    [hourKey]: parseInt(hour),
    [minuteKey]: parseInt(minute),
    [periodKey]: period,
  };
});

const time = computed(() => {
  const day = Day(props.modelValue);
  if (!day.isValid || !props.modelValue) return '';
  return Day(props.modelValue).format('hh:mm a');
});

function onInput(v: {
  [hourKey]: number;
  [minuteKey]: number;
  [periodKey]: 'AM' | 'PM';
}) {
  const isPM = v[periodKey] === 'PM';
  let h = v[hourKey];
  if (h === 12) {
    h = isPM ? 12 : 0;
  } else if (isPM) {
    h += 12;
  }
  const d = Day(props.modelValue)
    .hour(h)
    .minute(v[minuteKey])
    .second(0)
    .millisecond(0);
  emits('update:model-value', d.toDate());
  popup.value?.hide();
}
</script>

<template>
  <div class="time-picker">
    <q-input
      :model-value="time"
      :placeholder="placeholder"
      dense
      outlined
      readonly
    >
      <q-popup-proxy v-if="!disable" ref="popup">
        <column-roller
          :initial-value="initialValue"
          :options="options"
          @confirm="onInput"
        />
      </q-popup-proxy>

      <template #append>
        <slot name="append" />
      </template>
    </q-input>
  </div>
</template>

<style lang="sass">
.time-picker
  .q-field__control:before
    border-style: solid !important
</style>
