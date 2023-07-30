import { createRouter, createWebHistory } from 'vue-router';

import routes, { validateRoute } from './routes';

const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHistory(),
});

Router.beforeEach(async (to, from, next) => {
  const res = await validateRoute(to, from);
  if (res !== true) {
    if (to.name === res) next();
    else next({ name: res });
    return;
  }

  next();
});

export default Router;
