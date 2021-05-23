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
    import(/* webpackChunkName: "macroModel" */ "@/views/macroModel.vue")
  },
  {
    path: "/detailModel",
    name: "detailModel",
    component: () =>
    import(/* webpackChunkName: "detailModel" */ "@/views/detailModel.vue")
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
    import(/* webpackChunkName: "pointText" */ "@/views/pointTextView.vue")
  },
  {
    path: "/customSkyBox",
    name: "customSkyBox",
    component: () =>
    import(/* webpackChunkName: "customSkyBox" */ "@/views/skyBoxView.vue")
  },
  {
    path: "/heatMap",
    name: "heatMap",
    component: () =>
    import(/* webpackChunkName: "heatMap" */ "@/views/heatMapView.vue")
  },
  {
    path: "/flowLine",
    name: "flowLine",
    component: () =>
    import(/* webpackChunkName: "flowLine" */ "@/views/flowLineView.vue")
  },
  {
    path: "/groundFlowLine",
    name: "groundFlowLine",
    component: () =>
    import(/* webpackChunkName: "groundFlowLine" */ "@/views/groundFlowLineView.vue")
  },
  {
    path: "/dynamicWall",
    name: "dynamicWall",
    component: () =>
    import(/* webpackChunkName: "dynamicWall" */ "@/views/dynamicWallView.vue")
  },
  {
    path: "/trailWall",
    name: "trailWall",
    component: () =>
    import(/* webpackChunkName: "trailWall" */ "@/views/trailWallView.vue")
  }
  ,
  {
    path: "/translateModel",
    name: "translateModel",
    component: () =>
    import(/* webpackChunkName: "translateModel" */ "@/views/translateModelView.vue")
  },
  {
    path: "/threeModel",
    name: "threeModel",
    component: () =>
    import(/* webpackChunkName: "threeModel" */ "@/views/threeModelView.vue")
  },
  {
    path: "/pickModel",
    name: "pickModel",
    component: () =>
    import(/* webpackChunkName: "pickModel" */ "@/views/threePickView.vue")
  },
  {
    path: "/pickModel1",
    name: "pickModel1",
    component: () =>
    import(/* webpackChunkName: "pickModel1" */ "@/views/threePickView1.vue")
  },
  {
    path: "/3DMap",
    name: "3DMap",
    component: () =>
    import(/* webpackChunkName: "3DMap" */ "@/views/threeMap.vue")
  },
  {
    path: "/ODline",
    name: "ODline",
    component: () =>
    import(/* webpackChunkName: "ODline" */ "@/views/threeODLine.vue")
  },
  {
    path: "/spreadCircle",
    name: "spreadCircle",
    component: () =>
    import(/* webpackChunkName: "spreadCircle" */ "@/views/threeSpreadCircle.vue")
  },
  {
    path: "/scanCircle",
    name: "scanCircle",
    component: () =>
    import(/* webpackChunkName: "scanCircle" */ "@/views/threeScanCircle.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
