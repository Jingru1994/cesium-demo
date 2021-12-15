<template>
  <div class="entity-point"></div>
</template>

<script>
import { findComponentUpward } from "@/utils/assist.js";
import DivGraphic from "@/utils/widgets/infoBox/DivGraphic.js";

import { getPublicData } from "@/api/requestData.js";
import HeightType from "@/utils/widgets/HeightType/HeightType";
import HorizontalReference from "@/utils/widgets/HorizontalReference/HorizontalReference";
import VerticalReference from "@/utils/widgets/VerticalReference/VerticalReference";

export default {
  name: "entity-point",
  props: {
    url: {
      type: String
    },
    heightType: {
      type: String
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.viewer = findComponentUpward(this, "cesiumViewer").viewer;
      this.addGeojson();
    });
  },
  destroyed() {
    console.log("entiti point destroy");
    this.divInfoList.forEach(divGraphic => {
      divGraphic.destroy();
    });
  },
  beforeDestroy() {
    // this.divInfoList.forEach(divGraphic => {
    //     divGraphic.destroy();
    // })
  },
  methods: {
    async addGeojson() {
      let viewer = this.viewer;
      const data = await getPublicData(this.url);
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
        const clickEvent = function() {
          console.log("click callback, type:", type);
          // that.$emit("pointClick", property);
        };
        const options = {
          position: coord,
          heightType: HeightType.TILES,
          html: html,
          verticalReference: VerticalReference.BOTTOM,
          horizontalReference: HorizontalReference.LEFT,
          xOffset: -30,
          yOffset: 0,
          clickEvent: clickEvent
        };
        if (this.heightType === "3dtiles") {
          options.heightType = HeightType.TILES;
        } else if (this.heightType === "terrain") {
          options.heightType = HeightType.TERRAIN;
        }
        const infoDivGraphic = new DivGraphic(options);

        // const infoDiv = infoDivGraphic.getElement();
        this.divInfoList.push(infoDivGraphic);
        infoDivGraphic.addTo(viewer);
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="scss">
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
.cesium-three-plugins-infotool-farm {
  height: 140px;
}
.cesium-three-plugins-infotool > div:nth-child(1) {
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
.cesium-three-plugins-infotool-farm > div:nth-child(2) {
  display: block;
}
.cesium-three-plugins-infotool > div:nth-child(1):hover + div {
  display: block;
}

.cesium-three-plugins-infotool-farm > div:nth-child(1) {
  width: 85px;
  height: 155px;
  background: url(~@/assets/point_farm.png) no-repeat center 100%;
  background-size: 90px;
}
.cesium-three-plugins-infotool-camera > div:nth-child(1) {
  width: 115px;
  height: 137px;
  background: url(~@/assets/point_camera.png) no-repeat center 100%;
  background-size: 150px;
}
.cesium-three-plugins-infotool-camera > div:nth-child(1):hover {
  background: url(~@/assets/point_camera_hover.png) no-repeat center 100%;
  background-size: 150px;
}
.cesium-three-plugins-infotool-thermometer > div:nth-child(1) {
  width: 115px;
  height: 137px;
  background: url(~@/assets/point_tmp.png) no-repeat center 100%;
  background-size: 150px;
}
.cesium-three-plugins-infotool-thermometer > div:nth-child(1):hover {
  background: url(~@/assets/point_tmp_hover.png) no-repeat center 100%;
  background-size: 150px;
}
.cesium-three-plugins-infotool-person > div:nth-child(1) {
  width: 115px;
  height: 137px;
  background: url(~@/assets/point_person.png) no-repeat center 100%;
  background-size: 150px;
}
.cesium-three-plugins-infotool-person > div:nth-child(1):hover {
  background: url(~@/assets/point_person_hover.png) no-repeat center 100%;
  background-size: 150px;
}
</style>
