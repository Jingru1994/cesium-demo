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
  },
  {
    path: "/heatMap",
    name: "heatMap",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/heatMapView.vue")
  },
  {
    path: "/flowLine",
    name: "flowLine",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/flowLineView.vue")
  },
  {
    path: "/groundFlowLine",
    name: "groundFlowLine",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/groundFlowLineView.vue")
  },
  {
    path: "/dynamicWall",
    name: "dynamicWall",
    component: () =>
    import(/* webpackChunkName: "detail" */ "@/views/dynamicWallView.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
