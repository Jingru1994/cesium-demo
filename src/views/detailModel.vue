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
            pointUrl: "/data/detial_point2.geojson",
            showTerrain: true
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        // this.initCamera()
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
        initCamera() {
            // let cartesianPosition = new Cesium.Cartesian3(-6222983.759138448, 19996854.06201183, 14011193.373091104);
            // this.viewer.camera.setView({
            //     destination : cartesianPosition,
            //     orientation: {
            //     heading : 0.0, // east, default value is 0.0 (north)
            //     pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
            //     roll : 0.0  // default value
            //     }
            // });
        },
        zoomToTiles(tileset){
            let infobox = document.getElementsByClassName("cesium-three-plugins-infotool")
            this.infobox = infobox
            for(let i=0; i < infobox.length; i++) {
                infobox[i].style.opacity = 0
            }

            let cartesianPosition = new Cesium.Cartesian3(-6222983.759138448, 19996854.06201183, 14011193.373091104);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                heading : 0.0, // east, default value is 0.0 (north)
                pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
                roll : 0.0  // default value
                }
            });
            
            
            
            const that = this

            // // 如果tileset自带世界矩阵，那么计算放置的经纬度和heading
            // const mat0 = Cesium.Matrix4.fromArray(tileset._root.transform);
            // // 原来的矩阵的逆
            // const orginMatrixInverse = Cesium.Matrix4.inverse(mat0, new Cesium.Matrix4());

            // 模型的位置坐标（三维笛卡尔坐标）。Cartesian3
            const position = Cesium.Cartesian3.fromDegrees(122.251, 43.405, 0);
            // 模型的位置矩阵(WGS84 Matrix4)。
            const mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            // Heading（航向）是负z轴的旋转。Pitch（俯仰）是负y轴的旋转。Roll（滚动）是正x轴的旋转
            // 根据heading, 创建一个围绕z轴的旋转矩阵Matrix3。
            // 从 旋转矩阵Matrix3 转换成 旋转矩阵Matrix4。
            // var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(22)));
            // // 计算模型的 位置矩阵(WGS84 Matrix4) 和 旋转矩阵Matrix4 的乘积，并存储到模型的位置矩阵。
            // Cesium.Matrix4.multiply(mat, rotationX, mat);
            // 把新构造的模型矩阵（既可以表示位置，也能表示旋转）赋值给该模型的model._root.transform(转换)。
            tileset._root.transform = mat;

            let boundingSphere = tileset.boundingSphere;
            let cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);//获取到倾斜数据中心点的经纬度坐标（弧度）
            let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);//倾斜数据中心点的笛卡尔坐标 
            let offset =Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 210);//带高程的新笛卡尔坐标
            // let offset =Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 13);//带高程的新笛卡尔坐标
            let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            setTimeout(function() {
                let cartesianPosition1 = new Cesium.Cartesian3(-2477013.53495094, 3925401.675793496, 4360743.925894892);
                that.viewer.camera.flyTo({
                    destination : cartesianPosition1,
                    orientation: {
                        heading : 0.0, // east, default value is 0.0 (north)
                        pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
                        roll : 0.0  // default value
                    },
                    duration: 7
                });
                setTimeout(function() {
                    for(let i=0; i < that.infobox.length; i++) {
                        that.infobox[i].style.opacity = 1
                    }
                    let cartesianPosition2 = new Cesium.Cartesian3(-2477043.461295913, 3925526.139501486, 4360330.464346442);
                    that.viewer.camera.flyTo({
                        destination : cartesianPosition2,
                        orientation: {
                            heading : 0.0, // east, default value is 0.0 (north)
                            pitch : Cesium.Math.toRadians(-30.50),    // default value (looking down)
                            roll : 0.0  // default value
                        },
                    });
                },8000)
                
            },5000)
            
            


            // this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 0.15));
            // let cartesianPosition = new Cesium.Cartesian3(-2340488.8615332292, 5325525.154494965, 2607518.644244695);
            // this.viewer.camera.setView({
            //     destination : cartesianPosition,
            //     orientation: {
            //         heading : 0.0, // east, default value is 0.0 (north)
            //         pitch : Cesium.Math.toRadians(-28.65),    // default value (looking down)
            //         roll : 0.0  // default value
            //     }
            // });
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