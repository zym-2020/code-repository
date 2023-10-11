import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/demoOne",
    name: "DemoOne",
    component: () => import("@/views/DemoOneView.vue"),
  },
  {
    path: "/demoTwo",
    name: "DemoTwo",
    component: () => import("@/views/DemoTwoView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
