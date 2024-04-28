import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/demo1",
    name: "demo1",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "@/views/DemoOneView.vue"),
  },
  {
    path: "/demo2",
    name: "demo2",
    component: () => import("@/views/DemoTwoView.vue"),
  },
  {
    path: "/demo3",
    name: "demo3",
    component: () => import("@/views/DemoThreeView.vue"),
  },
  {
    path: "/demo4",
    name: "demo4",
    component: () => import("@/views/DemoFourView.vue"),
  },
  {
    path: "/demo5",
    name: "demo5",
    component: () => import("@/views/DemoFiveView.vue"),
  },
  {
    path: "/demo6",
    name: "demo6",
    component: () => import("@/views/DemoSixView.vue"),
  },
  {
    path: "/demo7",
    name: "demo7",
    component: () => import("@/views/DemoSevenView.vue"),
  },
  {
    path: "/demo8",
    name: "demo8",
    component: () => import("@/views/DemoEightView.vue"),
  },
  {
    path: "/demo9",
    name: "demo9",
    component: () => import("@/views/DemoNineView.vue"),
  },
  {
    path: "/demo10",
    name: "demo10",
    component: () => import("@/views/DemoTenView.vue"),
  },
  {
    path: "/demo11",
    name: "demo11",
    component: () => import("@/views/DemoElevenView.vue"),
  },
  {
    path: "/demo12",
    name: "demo12",
    component: () => import("@/views/DemoTwelveView.vue"),
  },
  {
    path: "/demo13",
    name: "demo13",
    component: () => import("@/views/DemoThirteen.vue"),
  },
  {
    path: "/symbol",
    name: "symbol",
    component: () => import("@/views/SymbolView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
