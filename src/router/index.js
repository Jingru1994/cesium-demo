import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: () =>
    import(/* webpackChunkName: "index" */ "@/views/index.vue")
  
  },
  {
    path: "/macroModel",
    name: "macroModel",
    component: () =>
    import(/* webpackChunkName: "index" */ "@/views/macroModel.vue")
  
  },
  {
    path: "/detailModel",
    name: "detailModel",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/detailModel.vue")
  
  },
  {
    path: "/detail",
    name: "detail",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/detail.vue")
  
  },
  {
    path: "/pointText",
    name: "pointText",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/pointTextView.vue")
  
  },
  {
    path: "/customSkyBox",
    name: "customSkyBox",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/skyBoxView.vue")
  
  }
];

const router = new VueRouter({
  routes
});

export default router;
