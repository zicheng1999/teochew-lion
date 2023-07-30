<script setup lang="ts">
import { ionCalendarOutline } from '@quasar/extras/ionicons-v5';
import dayjs from 'dayjs';
import { QPopupProxy } from 'quasar';
import { dashIcon } from 'src/assets/icons';
import { PropType, ref, computed } from 'vue';
import Calendar from '../calendar/Calendar.vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<{
      start: Date;
      end: Date;
    }>,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

const dateFormat = 'YYYY-MM-DD';
const formattedDate = computed(() => {
  return {
    start: dayjs(props.modelValue.start).format(dateFormat),
    end: dayjs(props.modelValue.end).format(dateFormat),
  };
});

const quickAccess = [
  {
    label: 'Today',
    value: {
      start: dayjs().startOf('day').toDate(),
      end: dayjs().endOf('day').toDate(),
    },
  },
  {
    label: 'Yesterday',
    value: {
      start: dayjs().subtract(1, 'days').startOf('day').toDate(),
      end: dayjs().subtract(1, 'days').endOf('day').toDate(),
    },
  },
  {
    label: 'Next 7 days',
    value: {
      start: dayjs().startOf('days').toDate(),
      end: dayjs().add(7, 'days').endOf('day').toDate(),
    },
  },
  {
    label: 'Last 7 days',
    value: {
      start: dayjs().subtract(7, 'days').startOf('day').toDate(),
      end: dayjs().subtract(1, 'days').endOf('day').toDate(),
    },
  },
  {
    label: 'This month',
    value: {
      start: dayjs().startOf('month').toDate(),
      end: dayjs().endOf('month').toDate(),
    },
  },
  {
    label: 'Last month',
    value: {
      start: dayjs().subtract(1, 'month').startOf('month').toDate(),
      end: dayjs().subtract(1, 'month').endOf('month').toDate(),
    },
  },
  {
    label: 'This year',
    value: {
      start: dayjs().startOf('year').toDate(),
      end: dayjs().endOf('year').toDate(),
    },
  },
  {
    label: 'Last year',
    value: {
      start: dayjs().subtract(1, 'year').startOf('year').toDate(),
      end: dayjs().subtract(1, 'year').endOf('year').toDate(),
    },
  },
];

const emits = defineEmits<{
  (
    event: 'update:model-value',
    v: {
      start: Date;
      end: Date;
    }
  ): void;
}>();

const popup = ref<QPopupProxy>();

function onInput(v: Date | { start: Date; end: Date }) {
  if (v instanceof Date) return;
  popup.value?.hide();
  emits('update:model-value', v);
}

function selectQuickAccess(v: { start: Date; end: Date }) {
  popup.value?.hide();
  emits('update:model-value', {
    start: dayjs(v.start).toDate(),
    end: dayjs(v.end).toDate(),
  });
}
</script>

<template>
  <div
    class="br-sm bordered q-pa-xs row items-center relative-position"
    :class="
      disable
        ? 'text-disabled cursor-not-allowed'
        : 'text-fsecondary cursor-pointer'
    "
  >
    <q-icon :name="ionCalendarOutline" class="q-ml-xs q-mr-sm" size="xs" />

    <template v-if="!inline">
      <div class="bg-neutral-100 br-sm q-px-md q-py-xs col">
        {{ formattedDate.start }}
      </div>

      <div class="q-px-sm">
        <q-icon :name="dashIcon" />
      </div>

      <div class="bg-neutral-100 br-sm q-px-md q-py-xs col">
        {{ formattedDate.end }}
      </div>
    </template>

    <div v-else class="col q-py-xs">
      {{ formattedDate.start }} <q-icon :name="dashIcon" />
      {{ formattedDate.end }}
    </div>

    <q-popup-proxy v-if="!disable" ref="popup" :breakpoint="800">
      <div class="row bg-white" style="height: 360px">
        <q-scroll-area class="q-pa-sm gt-sm full-height" style="width: 140px">
          <q-list class="q-gutter-y-sm">
            <q-item
              v-for="(option, index) in quickAccess"
              :key="index"
              dense
              clickable
              class="q-pa-sm bg-neutral-100 text-center br-sm t-system"
              @click="() => selectQuickAccess(option.value)"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-separator vertical class="gt-sm" />
        <calendar
          :model-value="modelValue"
          class="col"
          consecutive-month
          @update:model-value="onInput"
        />
      </div>
    </q-popup-proxy>
  </div>
</template>
