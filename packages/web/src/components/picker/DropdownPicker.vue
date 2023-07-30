<script setup lang="ts">
import { QSelect } from 'quasar';
import { computed, PropType, ref } from 'vue';
import { PickerOption } from '../type';

const props = defineProps({
  modelValue: {
    type: [String, Array] as PropType<string | string[]>,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array as PropType<PickerOption[]>,
    required: true,
  },
  allOptionsLabel: {
    type: String,
    default: 'All options',
  },
  noOptionLabel: {
    type: String,
    default: 'Select option',
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits<{
  (event: 'update:model-value', v: string | string[]): void;
}>();

const options = ref(props.options);
const select = ref<QSelect>();

const selectedValue = computed(() => {
  return typeof props.modelValue === 'string'
    ? [props.modelValue]
    : props.modelValue;
});

const allSelectorValue = computed(() => {
  const values = options.value.map((v) => v.value);
  const filtered = selectedValue.value.filter((v) => values.includes(v));
  if (filtered.length === options.value.length) return true;
  return filtered.length === 0 ? false : null;
});

const displayValue = computed<string>(() => {
  if (!selectedValue.value?.length) return props.noOptionLabel;

  const option = options.value.find(
    (opt) => opt.value === selectedValue.value[0]
  )?.label;
  if (!props.multiple) return option || props.noOptionLabel;

  if (selectedValue.value.length === 1) return option || '-';

  return allSelectorValue.value
    ? props.allOptionsLabel
    : `${selectedValue.value.length} Selected`;
});

function toggleAll() {
  const values = options.value.map((v) => v.value);
  const otherOptions = selectedValue.value.filter((v) => !values.includes(v));
  if (allSelectorValue.value) {
    emits('update:model-value', otherOptions);
  } else {
    emits('update:model-value', [...otherOptions, ...values]);
    select.value?.hidePopup();
  }
}

function onInput(v: string | string[]) {
  emits('update:model-value', v);
}

function filterFn(
  val: string,
  update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void
) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    options.value = props.options.filter(
      (v) => v.label.toLocaleLowerCase().indexOf(needle) > -1
    );
  });
}
</script>

<template>
  <q-select
    ref="select"
    :model-value="modelValue"
    :options="options"
    :multiple="multiple"
    :disable="disable"
    dense
    outlined
    emit-value
    map-options
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    @filter="filterFn"
    @update:model-value="onInput"
  >
    <template #selected>
      {{ displayValue }}
    </template>

    <template #before-options>
      <q-item v-if="multiple" clickable dense @click="toggleAll">
        <q-item-section side>
          <q-checkbox
            :model-value="allSelectorValue"
            dense
            @update:model-value="toggleAll"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ allOptionsLabel }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-bind="itemProps" dense>
        <q-item-section v-if="multiple" side>
          <q-checkbox
            :model-value="selected"
            dense
            @update:model-value="toggleOption(opt)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label :class="!multiple && selected ? 'primary' : 'black'">
            {{ opt.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
