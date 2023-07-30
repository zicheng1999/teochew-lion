import { QNotifyUpdateOptions } from 'quasar';
import { randomString } from 'src/helpers';
import { notify } from 'src/plugins';
import { useAppStore } from 'src/stores/app';
import { Ref, isRef, watch } from 'vue';

async function start<T>(
  fn: () => Promise<T>,
  config?: {
    onSuccess?: (resp: T) => Promise<void> | void;
    onError?: (err: unknown) => Promise<void> | void;
    onComplete?: () => Promise<void> | void;
    isGlobal?: boolean;
    customId?: string | string[];
  }
) {
  let resolveIds: string[] = [];
  if (!config || !config.customId)
    resolveIds.push(`${new Date().toISOString()}_${randomString(6)}`);
  else if (typeof config.customId === 'string')
    resolveIds.push(config.customId);
  else resolveIds = config.customId;
  const appStore = useAppStore();
  appStore.addLoadingQueues(
    resolveIds.map((id) => ({
      id,
      isGlobal: config?.isGlobal || false,
    }))
  );

  try {
    const resp = await fn();
    await config?.onSuccess?.(resp);
    return resp;
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : `${err}`;
    if (config?.onError) {
      await config.onError(errMessage);
    } else {
      notify.failed(errMessage);
    }
    throw err;
  } finally {
    appStore.resolveQueues(resolveIds);
    config?.onComplete?.();
  }
}

export default () => ({
  checkIsLoading: (id: string) => {
    return useAppStore().loadingQueue.some((q) => q.id === id);
  },
  global: async <T>(
    fn: () => Promise<T>,
    config?: {
      onSuccess?: (resp: T) => Promise<void> | void;
      successMessage?: string;
    }
  ) => {
    return await start<T>(fn, {
      isGlobal: true,
      onSuccess: async (resp) => {
        await config?.onSuccess?.(resp);
        if (config?.successMessage) notify.success(config?.successMessage);
      },
    });
  },
  minor: async <T>(
    fn: () => Promise<T>,
    config?: {
      customId?: string | string[];
      isLoading?: Ref<boolean>;
      message?: string | Ref<string>;
      caption?: string | Ref<string>;
      icon?: string;
      successMessage?: string;
      successIcon?: string;
    }
  ) => {
    let promptNewNotificationOnSuccess = false;
    const res = notify.info('Loading', {
      position: 'top-right',
      group: false,
      spinner: true,
      timeout: 0,
      ...config,
      caption: undefined,
      message: 'Loading',
      onDismiss: () => {
        promptNewNotificationOnSuccess = true;
      },
    });

    const streamable = (
      key: keyof QNotifyUpdateOptions,
      field: string | Ref<string> | undefined
    ) => {
      if (!field) return;
      if (isRef(field)) {
        res({ [key]: field.value });
        watch(field, (newV) => res({ [key]: newV }));
      } else {
        res({ [key]: field });
      }
    };
    streamable('message', config?.message);
    streamable('caption', config?.caption);
    return await start(
      async () => {
        if (config?.isLoading) config.isLoading.value = true;
        const resp = await fn();
        return resp;
      },
      {
        onSuccess: () => {
          const respMessage = config?.successMessage || 'Completed';
          if (!promptNewNotificationOnSuccess) {
            res({
              icon: config?.successIcon || 'done',
              message: respMessage,
              spinner: false,
              color: 'positive',
              timeout: 1000,
            });
          } else {
            notify.success(respMessage);
          }
        },
        onError: (err) => {
          const errMessage = `${err}` || 'Error';
          if (!promptNewNotificationOnSuccess) {
            res({
              icon: 'error',
              message: errMessage,
              spinner: false,
              color: 'negative',
              timeout: 1000,
            });
          } else {
            notify.failed(errMessage);
          }
        },
        onComplete: () => {
          if (config?.isLoading) config.isLoading.value = false;
        },
        customId: config?.customId,
      }
    );
  },
  custom: async <T>(
    fn: () => Promise<T>,
    config?: {
      isLoading?: Ref<boolean>;
      successMessage?: string;
      customId?: string | string[];
    }
  ) => {
    return await start(
      async () => {
        if (config?.isLoading) config.isLoading.value = true;
        return await fn();
      },
      {
        onSuccess: async () => {
          if (config?.successMessage) notify.success(config.successMessage);
        },
        onComplete: () => {
          if (config && config.isLoading) config.isLoading.value = false;
        },
        customId: config?.customId,
      }
    );
  },
});
