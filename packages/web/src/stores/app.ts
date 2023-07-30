import { defineStore } from 'pinia';
import { ref } from 'vue';

interface LoadingQueue {
  id: string;
  isGlobal: boolean;
}

export const useAppStore = defineStore('app', {
  state: () => ({
    loadingQueue: ref<LoadingQueue[]>([]),
    finishBooting: false,
  }),
  actions: {
    addLoadingQueues(queues: LoadingQueue[]) {
      this.loadingQueue = [...this.loadingQueue, ...queues];
    },
    clearLoadingQueue() {
      this.loadingQueue = [];
    },
    resolveQueues(queueIds: string[]) {
      this.loadingQueue = this.loadingQueue.filter(
        (queue) => !queueIds.includes(queue.id)
      );
    },
  },
});
