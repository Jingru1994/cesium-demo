<template>
    <div class="cesium-index">
        <cesium-viewer
            :showTerrain= showTerrain
        >
            <tileset-photogrammetry
                :url="photogrammetryUrl"
                @readyPromise="zoomToTiles"
            ></tileset-photogrammetry>
            <!-- <tileset-monomer
                :url="monomerUrl"
                :show="isMonomerShow"
            ></tileset-monomer>
            <primitive-geojson
                :url="geojsonUrl"
                :show="isGeojsonShow"
            >
            </primitive-geojson> -->
            <entity-point
                :url="pointUrl"
                heightType="3dtiles"
                @pointClick="pushRouter"
            >
            </entity-point>
        </cesium-viewer>
        <div class="toolbar">
            <div class="info-box">模型：{{dataId}}</div>
            <div>单体化类型：</div>
            <div class="radio-box">
                <input type="radio" name="type" v-model="type" value="geojson"/>geojson
                <input type="radio" name="type" v-model="type" value="tiles"/>3dtiles
            </div>
        </div>
        
        <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            width="30%">
            <span>{{dataId}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeDialog">取 消</el-button>
                <el-button type="primary" @click="closeDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
const { mapMutations, mapGetters } = createNamespacedHelpers("detailModel");
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import TilesetPhotogrammetry from "@/components/tilesetPhotogrammetry.vue";
import TilesetMonomer from "@/components/tilesetMonomer.vue";
import PrimitiveGeojson from "@/components/primitiveGeojson.vue";
import EntityPoint from "@/components/entityPoint.vue";





export default {
    name: "DetialModelView",
    components: {
      CesiumViewer,
      TilesetPhotogrammetry,
      TilesetMonomer,
      PrimitiveGeojson,
      EntityPoint
    },
    data() {
        return {
            isDialogVisible: false,
            photogrammetryUrl: "http://139.219.1.146/ce/tileset.json",
            monomerUrl: "http://192.168.40.26/file/farm-entity7/tileset.json",
            geojsonUrl:"data/farm_wgs84.geojson",
            type:"tiles",
            dataID:"",
            pointUrl: "/data/detial_point.geojson",
            showTerrain: true
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
    },
    beforeDestroy() {},
    computed: {
        ...mapGetters({
            dialogVisible:'dialogVisible',
            dataId: "dataId"
        }),
        isMonomerShow() {
            if(this.type === "tiles"){
              return true;
            }else {
              return false;
            }
        },
        isGeojsonShow() {
            if(this.type === "geojson"){
              return true;
            }else {
              return false;
            }
        }
    },
    methods: {
        ...mapMutations({
            setDialogVisible: 'SETDIALOGVISIBLE' 
        }),
        closeDialog(){
            this.setDialogVisible(false)
        },
        zoomToTiles(tileset){
            // this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 0.15));
            let cartesianPosition = new Cesium.Cartesian3(-2340488.8615332292, 5325525.154494965, 2607518.644244695);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-28.65),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        pushRouter(property){
            console.log(property);
            this.$router.push({
                path: "/detail",
                query: { data: property }
            });
            // if(property === 'camera'){
                
            // }
        }
    },
};
</script>

<style lang='scss' scoped>
.cesium-index {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    .toolbar{
        position:fixed;
        top: 10px;
        left: 10px;
        color: #ffffff;
        background: rgba(0,0,0,0.5);
        text-align: left;
    }
    .info-box {
      
      
    }
    .radio-box{
      
    }
}

</style>