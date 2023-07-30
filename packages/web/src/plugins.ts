import { Notify, QNotifyCreateOptions, copyToClipboard, Dialog } from 'quasar';
import Confirmation from './components/dialog/Confirmation.vue';
import { randomString } from './helpers';
import { useAppStore } from './stores/app';

Notify.setDefaults({
  message: '',
  position: 'top',
  timeout: 5000,
  textColor: 'white',
  actions: [],
});

interface ConfirmationData {
  title?: string;
  message?: string;
  buttonText?: string;
}

const prompt = {
  deleteConfirmation(v?: ConfirmationData) {
    return Dialog.create({
      component: Confirmation,
      componentProps: {
        icon: 'fa-solid fa-trash-can',
        color: 'negative',
        title: v?.title,
        message: v?.message,
        confirmText: v?.buttonText,
      },
    });
  },
  warningConfirmation(v?: ConfirmationData) {
    return Dialog.create({
      component: Confirmation,
      componentProps: {
        icon: 'fa-solid fa-circle-exclamation',
        color: 'primary',
        title: v?.title,
        message: v?.message,
        confirmText: v?.buttonText,
      },
    });
  },
};

const notify = {
  success(message: string, option?: QNotifyCreateOptions) {
    return Notify.create({
      ...option,
      message,
      color: 'positive',
      actions: [{ icon: 'close', color: 'white' }],
    });
  },
  failed(message: string, option?: QNotifyCreateOptions) {
    return Notify.create({
      ...option,
      message,
      color: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  },
  info(message: string, option?: QNotifyCreateOptions) {
    return Notify.create({
      ...option,
      message,
      color: 'info',
      actions: [{ icon: 'close', color: 'white' }],
    });
  },
};

async function toggleLoading<T>(func: () => Promise<T>): Promise<T> {
  const queueId = `${new Date().toISOString()}-${randomString(4)}`;
  const appStore = useAppStore();
  try {
    appStore.addLoadingQueues([
      {
        id: queueId,
        isGlobal: true,
      },
    ]);
    return await func();
  } catch (err) {
    if (err instanceof Error) {
      notify.failed(err.message);
    } else {
      notify.failed(`${err}`);
    }
    throw err;
  } finally {
    appStore.resolveQueues([queueId]);
  }
}

function clipboardCopy(
  content: string,
  opt?: { successMessage?: string; selectContent?: Element }
) {
  if (opt?.selectContent) {
    window.getSelection()?.selectAllChildren(opt.selectContent);
  }
  copyToClipboard(content).then(() => {
    notify.success(opt?.successMessage || 'Copied to clipboard', {
      timeout: 2000,
    });
  });
}

const workers: { id: string; worker: Worker }[] = [];
const workerTimeout = 5 * 60 * 1000; // in ms

/**
 * Use web worker to execute fn on other thread
 * reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 *
 * @param executeFn
 * function to execute
 * inside the function can call self.postMessage(data) to emit data
 *
 * @param callback
 * callback.fn will be execute when [executeFn] emit data
 *
 * @param workerTimeout
 * timeout in milliseconds for worker to terminate
 *
 * ! remember to terminate worker
 *   if no callback is provider or callback.terminateAfterCallback set to false,
 *   Not terminate worker will not release browser/computed resource
 */
function startWebworker(
  executeFn: () => void,
  callback?: {
    fn: (data: unknown, worker: Worker) => void;
    terminateAfterCallback: boolean;
  },
  timeout?: number
): Worker {
  /**
   * since web Worker only handle structured clone algorithm,
   * workaround by convert function to blob
   *
   * reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  const fnString = `const fn = ${executeFn.toString()};\nfn();`;
  const blob = new Blob([fnString]);
  const url = URL.createObjectURL(blob);

  const worker = new Worker(url);
  const workerId = new Date().toISOString();
  workers.push({ id: workerId, worker });
  setTimeout(
    () => {
      worker.terminate();
      const workerIndex = workers.findIndex(({ id }) => id === workerId);
      workers.splice(workerIndex, 1);
    },
    timeout === undefined ? workerTimeout : timeout
  );

  worker.onmessage = function (v) {
    if (!callback) return;
    callback.fn(v.data, worker);
    if (callback.terminateAfterCallback) worker.terminate();
  };
  return worker;
}

export { prompt, notify, toggleLoading, clipboardCopy, startWebworker };
