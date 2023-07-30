<script setup lang="ts">
import { PrimaryButton } from 'src/components/buttons';
import { clone } from 'src/helpers';
import { computed, PropType, ref, onMounted } from 'vue';

interface Option {
  label: string;
  value: any;
}

interface OptionGroup {
  title?: string;
  options: Option[];
}

const props = defineProps({
  initialValue: {
    type: Object as PropType<{ [key: string]: any }>,
    default: undefined,
  },
  options: {
    type: Object as PropType<{ [key: string]: OptionGroup }>,
    required: true,
  },
});

const emits = defineEmits<{
  (event: 'confirm', v: any): void;
}>();

const data = ref(
  clone(props.initialValue) ||
    Object.entries(props.options).reduce((pv, [key, option]) => {
      pv = {
        ...pv,
        [key]: option.options[0].value,
      };
      return pv;
    }, {})
);

const hasTitle = computed(() =>
  Object.values(props.options).some((opt) => opt.title)
);

function onConfirm() {
  emits('confirm', data.value);
}

onMounted(() => {
  const allSelectedOptions = document.getElementsByClassName(
    'selected-roller-option'
  );
  for (let index = 0; index < allSelectedOptions.length; index++) {
    const element = allSelectedOptions.item(index) as HTMLElement;
    element.parentElement?.scrollTo({ top: element?.offsetTop });
  }
});
</script>

<template>
  <div class="column-roller column" style="height: 260px; min-width: 180px">
    <div class="col row">
      <div
        v-for="(col, colKey) in options"
        :key="colKey"
        class="column-roller-group col full-height column relative-position text-center"
      >
        <div v-if="hasTitle" class="relative-position" style="min-height: 32px">
          <div
            class="full-width absolute-center overflow-auto"
            style="white-space: nowrap"
          >
            {{ col.title || '-' }}
          </div>
        </div>

        <q-separator />

        <div class="col overflow-auto hide-scrollbar">
          <div
            v-for="opt in col.options"
            :key="opt.value"
            :class="{
              'text-fprimary-3 selected-roller-option':
                data[colKey] === opt.value,
            }"
            class="q-pa-xs roller-option"
            @click="() => (data[colKey] = opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
    </div>
    <q-separator />
    <div class="q-pa-sm text-right">
      <primary-button label="Confirm" @click="onConfirm" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.column-roller
  .roller-option
    cursor: pointer

  .column-roller-group:before
    content: ""
    position: absolute
    right: 0
    height: 100%
    width: 1px
    background-color: grey

  .column-roller-group:nth-last-child(1):before
    width: 0px
</style>
