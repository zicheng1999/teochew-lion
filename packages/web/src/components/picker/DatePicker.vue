<script setup lang="ts">
import Day from 'dayjs';
import { QPopupProxy } from 'quasar';
import { ref, computed } from 'vue';
import Calendar from '../calendar/Calendar.vue';
import { DatePickerData } from '../type';

const props = defineProps({
  title: {
    type: String,
    default: 'Date',
  },
  modelValue: {
    type: Date,
    default: undefined,
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', v: Date): void;
}>();

const popup = ref<QPopupProxy>();

const date = computed(() => {
  return props.modelValue
    ? Day(props.modelValue).format('YYYY/MM/DD')
    : 'Not set';
});

function onDateChange(date: DatePickerData) {
  if (date instanceof Date) {
    emits('update:model-value', date);
    popup.value?.hide();
  }
}
</script>

<template>
  <div class="date-picker">
    <q-input :model-value="date" dense outlined readonly>
      <q-popup-proxy ref="popup">
        <calendar
          :model-value="props.modelValue || new Date()"
          @update:model-value="onDateChange"
        />
      </q-popup-proxy>

      <template v-if="$slots['append']" #append>
        <slot name="append" />
      </template>
    </q-input>
  </div>
</template>

<style lang="sass">
.date-picker
  .q-field__control:before
    border-style: solid !important
</style>
