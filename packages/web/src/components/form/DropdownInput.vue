<script setup lang="ts">
import { QSelect, useFormChild } from 'quasar';
import { PropType, computed, ref } from 'vue';
import AppForm from './AppForm.vue';

const props = defineProps({
  modelValue: {
    type: null as unknown as PropType<string | null>,
    validator: (v) => typeof v === 'string' || v === null,
    required: true,
  },
  options: {
    type: Array as PropType<
      {
        label: string;
        value: any;
        disable?: boolean;
      }[]
    >,
    required: true,
  },
  required: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  displayValue: {
    type: String,
    default: undefined,
  },
  noValue: {
    type: String,
    default: 'No value',
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', v: string | null): void;
}>();

const data = ref(props.options);
const filteredOptions = computed(() => {
  return !props.required && data.value.every((opt) => opt.value !== null)
    ? [
        {
          label: props.noValue,
          value: null,
        },
        ...data.value,
      ]
    : data.value;
});

const errMessage = ref('');

function resetValidation() {
  errMessage.value = '';
}

async function validate() {
  if (
    props.required &&
    data.value.every((opt) => opt.value !== props.modelValue)
  ) {
    errMessage.value = 'Required';
    return false;
  }
  errMessage.value = '';
  return true;
}

function onInput(v: string | null) {
  emits('update:model-value', v);
  resetValidation();
}

useFormChild({
  validate,
  resetValidation,
  requiresQForm: true,
});

function filterFn(
  val: string,
  update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void
) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    data.value = props.options.filter(
      (v) => v.label.toLocaleLowerCase().indexOf(needle) > -1
    );
  });
}
</script>

<template>
  <app-form :title="props.title" :required="props.required">
    <div @click.stop="null">
      <q-select
        :model-value="modelValue"
        :options="filteredOptions"
        :disable="disable"
        :error="!!errMessage"
        :error-message="errMessage"
        :display-value="displayValue"
        dense
        outlined
        emit-value
        hide-bottom-space
        map-options
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        @filter="filterFn"
        @update:model-value="onInput"
      />
    </div>
  </app-form>
</template>
