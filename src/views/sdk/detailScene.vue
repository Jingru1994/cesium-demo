<template>
  <div id="cesiumContainer" class="cesium-container detail-scene"></div>
</template>

<script>
import { getPublicData } from "@/api/requestData.js";
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import Photogrammetry from "@/utils/sdk/Cesium/Photogrammetry/Photogrammetry.js";
import DivGraphic from "@/utils/sdk/Cesium/DivGraphic/DivGraphic.js";
import HeightType from "@/utils/sdk/Cesium/HeightType/HeightType";
import HorizontalReference from "@/utils/sdk/Cesium/HorizontalReference/HorizontalReference";
import VerticalReference from "@/utils/sdk/Cesium/VerticalReference/VerticalReference";

import Cartesian3 from "cesium/Core/Cartesian3.js";
import ScreenSpaceEventHandler from "cesium/Core/ScreenSpaceEventHandler.js";
import CesiumMath from "cesium/Core/Math.js";
import ScreenSpaceEventType from "cesium/Core/ScreenSpaceEventType.js";
import "cesium/Widgets/widgets.css";

export default {
  data() {
    return {
      pointUrl: "data/detial_point.geojson",
      tileserUrl: "http://139.219.1.146/ce/tileset.json",
      showTerrain: true
    };
  },
  created() {
    // this.init();
  },
  mounted() {
    this.initViewer();
    this.addTiles(this.tileserUrl);
    this.addPoint(this.pointUrl);
    this.addClickEvent();
  },
  destroyed() {
    console.log("cesium viewer destroy");
    this.destroyViewer();
  },
  beforeDestroy() {},
  methods: {
    destroyViewer() {
      this.divInfoList.forEach(div => {
        div.destroy();
      });
      if (this.viewer) {
        this.viewer.destroy();
      }
    },
    initViewer() {
      const viewerOptions = {
        container: "cesiumContainer",
        IonToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODQxZGVkMy00YWY4LTQwYWEtYjA1MS1iZWY4OTk5NGY5MTQiLCJpZCI6MTM5MCwiaWF0IjoxNTI4MjAzNTMyfQ.f0GJ9hn2poToXqb0w8w_RN1AqjxkStR0m2ajNupPbDA",
        imageryUrl:
          "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
        showTerrain: this.showTerrain
      };
      let viewer = new MyViewer(viewerOptions);
      viewer = viewer.getElement();
      this.viewer = viewer;

      let cartesianPosition = new Cartesian3(
        -2340457.673487283,
        5325513.312575207,
        2607545.7937253853
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0, // east, default value is 0.0 (north)
          pitch: CesiumMath.toRadians(-34.38), // default value (looking down)
          roll: 0.0 // default value
        }
      });
    },
    addTiles(tileserUrl) {
      const that = this;
      const readyPromise = function(tileset) {
        console.log("readyPromise");
        that.$emit("readyPromise", tileset);
      };
      let viewer = this.viewer;
      let options = {
        url: tileserUrl,
        readyPromise: readyPromise
      };
      let tileset = new Photogrammetry(options);
      tileset.addTo(viewer);
      this.tileset = tileset;
    },
    async addPoint(pointUrl) {
      let viewer = this.viewer;
      const data = await getPublicData(pointUrl);
      this.divInfoList = [];
      data.features.forEach(element => {
        const label = element.properties.Name;
        const type = element.properties.Type;
        const coord = element.geometry.coordinates;
        const html = `
            <div class='cesium-three-plugins-infotool cesium-three-plugins-infotool-${type}'>
                <div></div>
                <div>${label}</div>
            </div>
        `;
        const infoDivGraphic = new DivGraphic({
          position: coord,
          heightType: HeightType.TERRAIN,
          html: html,
          verticalReference: VerticalReference.BOTTOM,
          horizontalReference: HorizontalReference.LEFT,
          xOffset: -40,
          yOffset: 0
        });
        // const infoDiv = infoDivGraphic.getElement();
        this.divInfoList.push(infoDivGraphic);
        infoDivGraphic.addTo(viewer);
      });
    },
    addClickEvent() {
      let clickHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
      clickHandler.setInputAction(movement => {
        console.log(this.viewer);
        let pickedFeature = this.viewer.scene.pick(movement.position);
        console.log(pickedFeature);

        let position = this.viewer.camera.position;
        let heading = CesiumMath.toDegrees(this.viewer.camera.heading).toFixed(
          2
        );
        let pitch = CesiumMath.toDegrees(this.viewer.camera.pitch).toFixed(2);
        console.log(position + "," + heading + "," + pitch);
      }, ScreenSpaceEventType.LEFT_CLICK);
    }
  }
};
</script>

<style lang="scss">
.cesium-container.detail-scene {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  .cesium-three-plugins-infotool {
    display: flex;
    position: relative;
    top: 0;
    left: 0;
    min-width: 100px;
    height: 120px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    // background-color: black;
  }
  .cesium-three-plugins-infotool > div:nth-child(1) {
    width: 115px;
    height: 137px;
    left: 0;
    bottom: 0;
  }
  .cesium-three-plugins-infotool > div:nth-child(2) {
    height: 27px;
    color: #dead49;
    border: 1px solid #dead49;
    background-color: #0e1c2b;
    padding: 5px 10px;
    user-select: text;
    pointer-events: auto;
    cursor: pointer;
    display: none;
    z-index: 9999;
  }
  .cesium-three-plugins-infotool > div:nth-child(1):hover + div {
    display: block;
  }
  .cesium-three-plugins-infotool-camera > div:nth-child(1) {
    background: url(~@/assets/point_camera.png) no-repeat center 100%;
    background-size: 150px;
  }
  .cesium-three-plugins-infotool-camera > div:nth-child(1):hover {
    background: url(~@/assets/point_camera_hover.png) no-repeat center 100%;
    background-size: 150px;
  }
  .cesium-three-plugins-infotool-thermometer > div:nth-child(1) {
    background: url(~@/assets/point_tmp.png) no-repeat center 100%;
    background-size: 150px;
  }
  .cesium-three-plugins-infotool-thermometer > div:nth-child(1):hover {
    background: url(~@/assets/point_tmp_hover.png) no-repeat center 100%;
    background-size: 150px;
  }
  .cesium-three-plugins-infotool-person > div:nth-child(1) {
    background: url(~@/assets/point_person.png) no-repeat center 100%;
    background-size: 150px;
  }
  .cesium-three-plugins-infotool-person > div:nth-child(1):hover {
    background: url(~@/assets/point_person_hover.png) no-repeat center 100%;
    background-size: 150px;
  }
}
</style>
