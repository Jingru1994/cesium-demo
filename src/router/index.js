import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import(/* webpackChunkName: "index" */ "@/views/index.vue")
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
      import(
        /* webpackChunkName: "groundFlowLine" */ "@/views/groundFlowLineView.vue"
      )
  },
  {
    path: "/dynamicWall",
    name: "dynamicWall",
    component: () =>
      import(
        /* webpackChunkName: "dynamicWall" */ "@/views/dynamicWallView.vue"
      )
  },
  {
    path: "/trailWall",
    name: "trailWall",
    component: () =>
      import(/* webpackChunkName: "trailWall" */ "@/views/trailWallView.vue")
  },
  {
    path: "/translateModel",
    name: "translateModel",
    component: () =>
      import(
        /* webpackChunkName: "translateModel" */ "@/views/translateModelView.vue"
      )
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
      import(
        /* webpackChunkName: "spreadCircle" */ "@/views/threeSpreadCircle.vue"
      )
  },
  {
    path: "/scanCircle",
    name: "scanCircle",
    component: () =>
      import(/* webpackChunkName: "scanCircle" */ "@/views/threeScanCircle.vue")
  },
  {
    path: "/macroScene",
    name: "macroScene",
    component: () =>
      import(/* webpackChunkName: "macroScene" */ "@/views/threeMacroScene.vue")
  },
  {
    path: "/adjustLight",
    name: "adjustLight",
    component: () =>
      import(
        /* webpackChunkName: "adjustLight" */ "@/views/threeAdjustLight.vue"
      )
  },
  {
    path: "/dof",
    name: "dof",
    component: () =>
      import(/* webpackChunkName: "dof" */ "@/views/threeDof.vue")
  },
  {
    path: "/dof2",
    name: "dof2",
    component: () =>
      import(/* webpackChunkName: "dof2" */ "@/views/threeDof2.vue")
  },
  {
    path: "/hTilt",
    name: "hTilt",
    component: () =>
      import(/* webpackChunkName: "hTilt" */ "@/views/threeHTilt.vue")
  },
  {
    path: "/dofMask",
    name: "dofMask",
    component: () =>
      import(/* webpackChunkName: "dofMask" */ "@/views/threeDofMask.vue")
  },
  {
    path: "/glowShield",
    name: "glowShield",
    component: () =>
      import(/* webpackChunkName: "glowShield" */ "@/views/threeGlowShield.vue")
  },
  {
    path: "/curveMove",
    name: "curveMove",
    component: () =>
      import(/* webpackChunkName: "curveMove" */ "@/views/threeCurveMove.vue")
  },
  {
    path: "/cylinderChart",
    name: "cylinderChart",
    component: () =>
      import(
        /* webpackChunkName: "cylinderChart" */ "@/views/threeCylinderChart.vue"
      )
  },
  {
    path: "/scene2",
    name: "scene2",
    component: () =>
      import(/* webpackChunkName: "scene2" */ "@/views/threeScene2.vue")
  },
  {
    path: "/3DHeatMap",
    name: "3DHeatMap",
    component: () =>
      import(/* webpackChunkName: "3DHeatMap" */ "@/views/threeHeatmap.vue")
  },
  {
    path: "/deviceControl",
    name: "deviceControl",
    component: () =>
      import(
        /* webpackChunkName: "deviceControl" */ "@/views/threeDeviceControl.vue"
      )
  },
  {
    path: "/deviceCondition",
    name: "deviceCondition",
    component: () =>
      import(
        /* webpackChunkName: "deviceCondition" */ "@/views/threeDeviceCondition.vue"
      )
  },
  {
    path: "/pathInspection",
    name: "pathInspection",
    component: () =>
      import(
        /* webpackChunkName: "pathInspection" */ "@/views/threePathInspection.vue"
      )
  },
  {
    path: "/fireParticle",
    name: "fireParticle",
    component: () =>
      import(
        /* webpackChunkName: "fireParticle" */ "@/views/threeFireParticle.vue"
      )
  },
  {
    path: "/pipe",
    name: "pipe",
    component: () =>
      import(/* webpackChunkName: "pipe" */ "@/views/threePipe.vue")
  },
  {
    path: "/water",
    name: "water",
    component: () =>
      import(/* webpackChunkName: "water" */ "@/views/threeWater.vue")
  },
  {
    path: "/terrain",
    name: "terrain",
    component: () =>
      import(/* webpackChunkName: "terrain" */ "@/views/threeTerrain.vue")
  },
  {
    path: "/tourism",
    name: "tourism",
    component: () =>
      import(/* webpackChunkName: "toursim" */ "@/views/threeTourism.vue")
  },
  {
    path: "/test",
    name: "test",
    component: () =>
      import(/* webpackChunkName: "test" */ "@/views/detailModel copy.vue")
  },
  {
    path: "/sdkDetailScene",
    name: "sdkDetailScene",
    component: () =>
      import(
        /* webpackChunkName: "sdkDetailScene" */ "@/views/sdk/detailScene.vue"
      )
  },
  {
    path: "/sdkFloatText",
    name: "sdkFloatText",
    component: () =>
      import(
        /* webpackChunkName: "sdkFloatText" */ "@/views/sdk/floatTextView.vue"
      )
  },
  {
    path: "/sdkFlowLine",
    name: "sdkFlowLine",
    component: () =>
      import(
        /* webpackChunkName: "sdkFlowLine" */ "@/views/sdk/flowLineView.vue"
      )
  },
  {
    path: "/sdkSlideWall",
    name: "sdkSlideWall",
    component: () =>
      import(
        /* webpackChunkName: "sdkSlideWall" */ "@/views/sdk/slideWallView.vue"
      )
  },
  {
    path: "/sdkScrollWall",
    name: "sdkScrollWall",
    component: () =>
      import(
        /* webpackChunkName: "sdkScrollWall" */ "@/views/sdk/scrollWallView.vue"
      )
  },
  {
    path: "/sdkHeatmap",
    name: "sdkHeatmap",
    component: () =>
      import(/* webpackChunkName: "sdkHeatmap" */ "@/views/sdk/heatMapView.vue")
  },
  {
    path: "/sdkSkybox",
    name: "sdkSkybox",
    component: () =>
      import(/* webpackChunkName: "sdkSkybox" */ "@/views/sdk/customSkyBox.vue")
  },
  {
    path: "/sdkTransformModel",
    name: "sdkTransformModel",
    component: () =>
      import(
        /* webpackChunkName: "sdkTransformModel" */ "@/views/sdk/transformModelView.vue"
      )
  },
  {
    path: "/sdkInitScene",
    name: "sdkInitScene",
    component: () =>
      import(
        /* webpackChunkName: "sdkInitScene" */ "@/views/sdk/three/createScene.vue"
      )
  },
  {
    path: "/sdkLoadModel",
    name: "sdkLoadModel",
    component: () =>
      import(
        /* webpackChunkName: "sdkLoadModel" */ "@/views/sdk/three/loadModel.vue"
      )
  },
  {
    path: "/sdkGradientColor",
    name: "sdkGradientColor",
    component: () =>
      import(
        /* webpackChunkName: "sdkLoadModel" */ "@/views/sdk/three/gradientColorPlane.vue"
      )
  },
  {
    path: "/sdkPickModel",
    name: "sdkPickModel",
    component: () =>
      import(
        /* webpackChunkName: "sdkPickModel" */ "@/views/sdk/three/pickModel.vue"
      )
  },
  {
    path: "/sdkPickModel2",
    name: "sdkPickModel2",
    component: () =>
      import(
        /* webpackChunkName: "sdkPickModel2" */ "@/views/sdk/three/pickModel2.vue"
      )
  },
  {
    path: "/sdkMap",
    name: "sdkMap",
    component: () =>
      import(
        /* webpackChunkName: "sdkMap" */ "@/views/sdk/three/pickableMap.vue"
      )
  },
  {
    path: "/sdkODLine",
    name: "sdkODLine",
    component: () =>
      import(/* webpackChunkName: "sdkODLine" */ "@/views/sdk/three/ODLine.vue")
  },
  {
    path: "/sdkSpreadCircle",
    name: "sdkSpreadCircle",
    component: () =>
      import(
        /* webpackChunkName: "sdkSpreadCircle" */ "@/views/sdk/three/spreadCircle.vue"
      )
  },
  {
    path: "/sdkScanCircle",
    name: "sdkScanCircle",
    component: () =>
      import(
        /* webpackChunkName: "sdkScanCircle" */ "@/views/sdk/three/scanCircle.vue"
      )
  },
  {
    path: "/sdkPatternShield",
    name: "sdkPatternShield",
    component: () =>
      import(
        /* webpackChunkName: "sdkPartternShield" */ "@/views/sdk/three/patternShield.vue"
      )
  },
  {
    path: "/sdkCurveMove",
    name: "sdkCurveMove",
    component: () =>
      import(
        /* webpackChunkName: "sdkCurveMove" */ "@/views/sdk/three/curveMove.vue"
      )
  },
  {
    path: "/threeSvg",
    name: "threeSvg",
    component: () =>
      import(/* webpackChunkName: "threeSvg" */ "@/views/threeSvg.vue")
  },
  {
    path: "/threeSvg1",
    name: "threeSvg1",
    component: () =>
      import(/* webpackChunkName: "threeSvg1" */ "@/views/threeSvg1.vue")
  },
  {
    path: "/threeFather",
    name: "threeFather",
    component: () =>
      import(/* webpackChunkName: "threeFather" */ "@/views/threeFather.vue")
  },
  {
    path: "/threeStation",
    name: "threeStation",
    component: () =>
      import(/* webpackChunkName: "threeStation" */ "@/views/threeStation.vue")
  },
  {
    path: "/threeTrace",
    name: "threeTrace",
    component: () =>
      import(/* webpackChunkName: "threeStation" */ "@/views/threeTrace.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
