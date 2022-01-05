<template>
  <div class="trace-map-container">
    <video id="myVideo" muted :autoplay="true" loop="loop" width="100%">
      <source :src="videoUrl" type="video/mp4" />
    </video>
    <div
      id="cesium-container"
      class="cesium-container"
      v-show="selectedMode === 'map'"
    ></div>
    <a-select
      v-show="selectedMode === 'map'"
      class="point-search"
      show-search
      label-in-value
      :value="searchValue"
      placeholder="请输入试点名称"
      :default-active-first-option="false"
      :filter-option="false"
      :show-arrow="false"
      :not-found-content="fetching ? undefined : null"
      @search="fetchPointList"
      @change="handleChange"
    >
      <a-spin v-if="fetching" slot="notFoundContent" size="small" />
      <a-select-option v-for="point in searchPointList" :key="point.code">
        {{ point.name }}
      </a-select-option>
    </a-select>
    <div
      v-if="dataLoaded"
      class="img-list-title"
      v-show="selectedMode === 'map'"
    >
      {{ selectedPoint.name }}监控
    </div>
    <div
      class="img-list-title-segmentation"
      v-show="selectedMode === 'map'"
    ></div>
    <div class="img-list" v-show="selectedMode === 'map'">
      <!-- <div> -->
      <img
        v-for="(item, index) in imgList"
        :key="index"
        class="camera-picture"
        :src="item"
      />
      <!-- </div> -->
    </div>
    <div class="border borderLT"></div>
    <div class="border borderRT"></div>
    <div class="border borderLB"></div>
    <div class="border borderRB"></div>
    <div class="switch-btn-container">
      <div v-show="selectedMode === 'map'" class="select-btn map">
        牧场监控
      </div>
      <div class="switch-btn map" @click="mapClick">牧场监控</div>
      <div v-show="selectedMode === 'model'" class="select-btn model">
        生长模型
      </div>
      <div class="switch-btn model" @click="mapClick">生长模型</div>
    </div>
    <div
      class="point-info"
      v-if="dataLoaded"
      v-show="hasPointSelected && selectedMode === 'map'"
    >
      <div class="info-left-layout-scope">
        <div class="info-scope farmer-info">
          <div class="info-title">农户信息</div>
          <div class="segmentation"></div>
          <div class="info-content1">
            <!-- <img class="photo-info" :src="selectedPointInfo.farmer.photo"/> -->
            <img class="photo-info" src="@/assets/farmer-photo.png" />
            <div class="text-info">
              <div class="info-filed">
                <div class="filed-name farmer">姓名：</div>
                <div class="filed-value farmer">
                  {{ selectedPointInfo.nnxx.farmerName }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name farmer">性别：</div>
                <div class="filed-value farmer">
                  {{ selectedPointInfo.nnxx.farmerGender }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name farmer">年龄：</div>
                <div class="filed-value farmer">
                  {{ selectedPointInfo.nnxx.farmerAge }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name farmer">养殖经验：</div>
                <div class="filed-value farmer">
                  {{ selectedPointInfo.nnxx.farmerYear }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="info-scope parish-info">
          <div class="info-title">牧区信息</div>
          <div class="segmentation"></div>
          <div class="info-content2">
            <div class="info-filed">
              <div class="filed-name parish">牧区名称：</div>
              <div class="filed-value parish">
                {{ selectedPointInfo.mqxx.parishName }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name parish">牧区位置：</div>
              <div class="filed-value parish">
                {{ selectedPointInfo.mqxx.parishPosition }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name parish">拥有草场面积：</div>
              <div class="filed-value parish">
                {{ selectedPointInfo.mqxx.pastureArea }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name parish">草地级别：</div>
              <div class="filed-value parish">
                {{ selectedPointInfo.mqxx.pastureLevel }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name parish">草地所含药材：</div>
              <div class="filed-value parish">
                {{ selectedPointInfo.mqxx.herbs }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-right-layout-scope">
        <div class="info-scope shed-info">
          <div class="info-title">棚舍情况</div>
          <div class="segmentation"></div>
          <div class="info-content2">
            <div
              class="sub-content"
              v-for="(item, index) in selectedPointInfo.psqk"
              v-show="index < showNum"
              :key="index"
            >
              <div class="info-filed">
                <div class="filed-name shed">名称：</div>
                <div class="filed-value shed">
                  {{ item.shedName }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name shed">位置：</div>
                <div class="filed-value shed">
                  {{ item.shedPosition }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name shed">面积：</div>
                <div class="filed-value shed">
                  {{ item.shedArea }}
                </div>
              </div>
              <div class="info-filed">
                <div class="filed-name shed">养殖数量：</div>
                <div class="filed-value shed">
                  {{ item.shedNum }}
                </div>
              </div>
            </div>
            <div class="show-more" @click="showMore">
              <div class="show-more-text">
                {{ showMoreTxt }}
              </div>
              <div class="arrow">{{ showMoreTxt1 }}</div>
            </div>
          </div>
        </div>
        <div class="info-scope disinfect-info">
          <div class="info-title">最新消毒记录</div>
          <div class="segmentation"></div>
          <div class="info-content2">
            <div class="info-filed">
              <div class="filed-name disinfect">日期：</div>
              <div class="filed-value disinfect">
                {{ selectedPointInfo.zxxdjl.disinfectDate }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name disinfect">方式：</div>
              <div class="filed-value disinfect">
                {{ selectedPointInfo.zxxdjl.disinfectType }}
              </div>
            </div>
            <div class="info-filed">
              <div class="filed-name disinfect">药品：</div>
              <div class="filed-value disinfect">
                {{ selectedPointInfo.zxxdjl.disinfectant }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-close-layout-scope" @click="closeInfo">
        <div class="info-close-btn">✕</div>
      </div>
    </div>
  </div>
</template>

<script>
import "cesium/Widgets/widgets.css";
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import DivGraphic from "@/utils/widgets/DivGraphic/DivGraphic.js";
import exampleData from "@/utils/pilotData.js";
import HeightType from "@/utils/sdk/Cesium/HeightType/HeightType";
import HorizontalReference from "@/utils/widgets/HorizontalReference/HorizontalReference";
import VerticalReference from "@/utils/widgets/VerticalReference/VerticalReference";

import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";

import "ant-design-vue/dist/antd.css";
import Input from "ant-design-vue/lib/input";
import Select from "ant-design-vue/lib/select";
import "@/utils/trace.css";

export default {
  props: {
    year: {
      type: [String, Number]
      // require: true
    }
  },
  components: {
    ASelect: Select,
    ASelectOption: Select.Option
  },
  data() {
    return {
      dataLoaded: false,
      selectedMode: "map",
      pointList: [],
      selectedPoint: {},
      selectedPointInfo: {},
      videoUrl: "images/goat.mp4",
      imgList: [],
      selectedPointName: undefined,
      hasPointSelected: false,
      showMoreTxt: "更多",
      showMoreTxt1: "˅",
      isShowMore: true,
      showNum: 1,
      searchPointList: [],
      searchPointListCopy: [],
      searchValue: [],
      fetching: false
    };
  },
  async mounted() {
    this.handler = {};
    this.pointList = await this.queryData(this.year);
    this.selectedPoint = this.pointList[0];
    // this.selectedPointInfo = await this.queryData(this.selectedPoint.code);
    this.selectedPointInfo = this.selectedPoint;
    this.dataLoaded = true;
    this.selectedPointName = this.selectedPoint.name;
    // this.imgList = this.selectedPoint.jkxx;
    this.imgList = [
      "images/negx.jpg",
      "images/negy.jpg",
      "images/negz.jpg",
      "images/posx.jpg",
      "images/posy.jpg",
      "images/posz.jpg"
    ];
    console.log(this.pointList);
    console.log(this.selectedPoint);

    this.initViewer(this.selectedPoint);
    this.addPoint(this.pointList);
  },
  methods: {
    data() {
      return {
        divInfoList: []
      };
    },
    async queryData(year) {
      // let data = await queryStationList(year);
      // this.stationData = data;
      return exampleData;
    },
    async queryPointList(year) {
      // let data = await queryStationList(year);
      // this.stationData = data;
      return exampleData;
    },
    async queryPointInfo(year) {
      // let data = await queryStationList(year);
      // this.stationData = data;
      return exampleData;
    },
    initViewer(point) {
      const viewerOptions = {
        container: "cesium-container",
        IonToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODQxZGVkMy00YWY4LTQwYWEtYjA1MS1iZWY4OTk5NGY5MTQiLCJpZCI6MTM5MCwiaWF0IjoxNTI4MjAzNTMyfQ.f0GJ9hn2poToXqb0w8w_RN1AqjxkStR0m2ajNupPbDA",
        imageryUrl:
          "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
        showTerrain: false
      };
      let viewer = new MyViewer(viewerOptions);
      viewer = viewer.getElement();
      this.viewer = viewer;
      if (point) {
        const position = [point.x, point.y, 20000];
        let cartesianPosition = new Cartesian3.fromDegrees(...position);
        this.viewer.camera.setView({
          destination: cartesianPosition,
          orientation: {
            heading: 0.0, // east, default value is 0.0 (north)
            pitch: CesiumMath.toRadians(-90), // default value (looking down)
            roll: 0.0 // default value
          }
        });
      }
    },
    addPoint(pointList) {
      const divGraphicList = [];
      for (const point of pointList) {
        const html = `
            <div class='cesium-three-plugins-infotool ${point.code}'>
                <div class='infotool-panel'><span class='point-icon'></span>${point.name}</div>
                <div class='infotool-line' ></div>
                <div class='infotool-circle' ></div>
            </div>
        `;
        const divGraphic = new DivGraphic({
          position: [point.x, point.y],
          heightType: HeightType.NONE,
          html: html,
          verticalReference: VerticalReference.BOTTOM,
          horizontalReference: HorizontalReference.CENTER,
          xOffset: 0,
          yOffset: 0
        });
        divGraphic.addTo(this.viewer);
        divGraphicList.push(divGraphic);
      }
      const divGraphicLayer = document.querySelector(".cesium-container");
      const that = this;
      divGraphicLayer.addEventListener(
        "click",
        this.divLayerClickEvent("pointClick", that)
      );
    },
    divLayerClickEvent(index, that) {
      return (
        this.handler[index] ||
        (this.handler[index] = function(e) {
          if (e.target.className === "infotool-panel") {
            if (!that.selectedPointDiv) {
              that.selectedPointDiv = e.target;
            } else {
              that.selectedPointDiv.className = "infotool-panel";
              that.selectedPointDiv = e.target;
            }
            that.selectedPointDiv.className += " click";

            const stationId = that.selectedPointDiv.parentNode.classList[1];

            that.$emit("clickStation", stationId);
            that.hasPointSelected = true;
            that.selectedPoint = that.pointList.find(item => {
              return item.code === stationId;
            });
            // this.imgList = that.selectedPoint.jkxx;
            // that.selectedPointInfo = await that.queryPointInfo(stationId);
            that.selectedPointInfo = that.pointList.find(item => {
              return item.code === stationId;
            });
            console.log(that.selectedPoint);
          }
        })
      );
    },
    mapClick(e) {
      this.selectedMode = e.target.classList[1];
    },
    showMore(e) {
      console.log(e);
      this.isShowMore = !this.isShowMore;
      this.showNum = this.isShowMore ? 1 : this.selectedPoint.psqk.length;
      this.showMoreTxt = this.isShowMore ? "更多" : "收起";
      this.showMoreTxt1 = this.isShowMore ? "˅" : "˄";
    },
    closeInfo() {
      this.hasPointSelected = false;
      this.selectedPointDiv.className = "infotool-panel";
    },
    fetchPointList(value) {
      this.data = [];
      this.fetching = true;
      // let data = this.queryPointList(this.year,value);
      // this.searchPointList = data;
      this.searchPointList = exampleData;
      this.searchPointListCopy = exampleData;
      console.log(this.searchPointList);
      this.fetching = true;
    },
    handleChange(value) {
      this.searchPointList = [];
      this.fetching = false;
      this.searchValue = value;

      const code = value.key;
      console.log(code);
      console.log(this.searchPointListCopy);
      const point = this.searchPointListCopy.find(item => {
        return item.code === code;
      });
      console.log(point);
      if (point) {
        const position = [point.x, point.y, 20000];
        let cartesianPosition = new Cartesian3.fromDegrees(...position);
        this.viewer.camera.flyTo({
          destination: cartesianPosition,
          orientation: {
            heading: 0.0, // east, default value is 0.0 (north)
            pitch: CesiumMath.toRadians(-90), // default value (looking down)
            roll: 0.0 // default value
          }
        });
      }
    }
  }
};
</script>

<style lang="scss">
.cesium-container {
  width: 100%;
  height: 533px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
  position: absolute;
  .infotool-panel {
    cursor: pointer;
    color: #ffffff;
    font: bold 18px/18px "Source Han Sans CN";
    border: 1px solid #5df5a0;
    padding: 7px 8px 6px 30px;
    background-color: rgba(4, 17, 59, 0.5);
    background-image: url(~@/assets/point_icon.png);
    background-repeat: no-repeat;
    background-position: 5px;
    background-size: 15px;
    white-space: nowrap;
  }
  .infotool-panel.click {
    background-color: rgba(5, 103, 254, 1);
  }
  .infotool-line {
    height: 40px;
    width: 1px;
    background: #5df5a0;
    margin: 0 auto;
  }
  .infotool-circle {
    transform: translate(0, -50%);
    width: 20px;
    height: 10px;
    margin: 0 auto;
    background: rgba(93, 245, 160, 0.5);
    -moz-border-radius: 10px / 5px;
    -webkit-border-radius: 10px / 5px;
    border-radius: 10px / 5px;
    border: 1px solid #5df5a0;
  }
}
.trace-map-container {
  #myVideo {
    position: absolute;
    top: 0px;
    left: 0px;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  .switch-btn-container {
    position: absolute;
    top: 78px;
    left: 475px;
  }
  .select-btn {
    color: #5df5a0;
    font: bold 16px/56px "Source Han Sans CN";
    position: absolute;
    width: 116px;
    height: 56px;
    background-image: url(~@/assets/selected-button.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .select-btn.map {
    top: 0px;
  }
  .select-btn.model {
    top: 56px;
  }
  .switch-btn {
    color: #5df5a0;
    font: bold 16px/30px "Source Han Sans CN";
    width: 90px;
    height: 30px;
    background-color: rgba(4, 17, 59, 0.3);
    margin: 13px 13px;
    cursor: pointer;
  }
  .switch-btn.map {
    margin-bottom: 26px;
  }
  .border {
    position: absolute;
    width: 121px;
    height: 113px;
  }
  .borderLT {
    top: 23px;
    left: 422px;
    background-image: url(~@/assets/border_LT.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .borderRT {
    top: 23px;
    right: 425px;
    background-image: url(~@/assets/border_RT.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .borderLB {
    bottom: 224px;
    left: 422px;
    background-image: url(~@/assets/border_LB.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .borderRB {
    bottom: 224px;
    right: 425px;
    background-image: url(~@/assets/border_RB.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .img-list-title {
    color: #5df5a0;
    position: absolute;
    top: 409px;
    left: 493px;
    font: bold 14px/14px "Source Han Sans CN";
  }
  .img-list-title-segmentation {
    position: absolute;
    top: 433px;
    left: 493px;
    width: 140px;
    height: 1px;
    background-image: url(~@/assets/segmentation.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .img-list {
    position: absolute;
    width: 883px;
    height: 97px;
    top: 444px;
    left: 438px;
    background-image: url(~@/assets/img-list-container.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .camera-picture {
    box-sizing: border-box;
    width: 121px;
    height: 75px;
    margin: 11px 5px;
    border: 1px solid #3754b9;
  }
  .point-info {
    position: absolute;
    top: 87px;
    left: 801px;
    width: 478px;
    height: 349px;
    background-color: rgba(4, 17, 59, 0.8);
    border: 1px solid #2140b2;
    overflow-y: auto;
    display: flex;
  }
  .point-info::-webkit-scrollbar {
    width: 4px;
  }
  .point-info::-webkit-scrollbar-track {
    background-color: rgba(4, 17, 59, 0);
  }
  .point-info::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }
  .info-left-layout-scope {
    box-sizing: border-box;
    padding: 13px 0px 13px 21px;
    width: 234px;
  }
  .info-right-layout-scope {
    box-sizing: border-box;
    padding: 13px 0px 13px 24px;
    width: 222px;
  }
  .info-close-layout-scope {
    position: sticky;
    top: 6px;
    width: 22px;
    margin-top: 6px;
  }
  .info-scope {
    margin-bottom: 15px;
  }
  .info-title {
    color: #5df5a0;
    font: bold 14px/14px "Source Han Sans CN";
    margin-bottom: 8px;
    text-align: start;
    // letter-spacing: 5px;
  }
  .segmentation {
    width: 193px;
    height: 1px;
    background-image: url(~@/assets/segmentation.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .info-content1 {
    padding-top: 18px;
    display: flex;
  }
  .info-content2 {
    padding-top: 18px;
  }
  .sub-content {
    margin-bottom: 10px;
  }
  .photo-info {
    width: 60px;
    height: 76px;
  }
  .text-info {
    width: 179px;
  }
  .info-filed {
    display: flex;
  }
  .filed-name {
    width: 66px;
    color: #98a2b0;
    font: bold 12px/12px "Source Han Sans CN";
    text-align: end;
    line-height: 20px;
  }
  .filed-name.farmer {
    width: 66px;
  }
  .filed-name.parish {
    width: 84px;
  }
  .filed-name.disinfect {
    width: 36px;
  }
  .filed-value {
    width: 66px;
    color: #ffffff;
    font: bold 12px/12px "Source Han Sans CN";
    text-align: start;
    line-height: 20px;
  }
  .filed-value.parish {
    width: 109px;
  }
  .filed-value.disinfect {
    width: 155px;
  }
  .show-more {
    width: 66px;
    text-align: end;
    cursor: pointer;
    color: #4483fd;
    font: bold 12px/12px "Source Han Sans CN";
    margin-top: -5px;
  }
  .show-more-text {
    display: inline-block;
    vertical-align: top;
  }
  .arrow {
    display: inline-block;
    font-size: 20px;
    vertical-align: top;
    margin-top: 5px;
  }
  .info-close-btn {
    cursor: pointer;
    color: #96a1bc;
    font-size: 14px;
    line-height: 14px;
    margin-right: 4px;
  }
  .point-search {
    top: 89px;
    width: 340px;
    height: 30px;
    box-sizing: border-box;
  }
}
</style>
