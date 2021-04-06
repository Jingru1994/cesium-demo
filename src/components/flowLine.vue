<template>
    <div class="flow-line"></div>
</template>

<script>
// import { createNamespacedHelpers } from "vuex";
// const { mapMutations, mapGetters } = createNamespacedHelpers("flowLine");

import Cartesian3 from 'cesium/Core/Cartesian3.js'
import PrimitiveCollection from 'cesium/Scene/PrimitiveCollection.js'
import Color from 'cesium/Core/Color.js'

import FlowLinePrimitive from "@/utils/widgets/FlowLine/FlowLinePrimitive.js"

import {findComponentUpward} from "@/utils/assist.js"
import {getPublicData} from "@/api/requestData";


export default {
    name: "flow-line",
    props: {
        url: {
            type: String
        },
        options: {
            type: Object,
            default: () => {
                return {
                    width: 3,
                    style: {
                        color: new Color( 0.5, 0.2, 0.0, 1.0),
                        speed: 5,
                        percent: 0.02,
                        gradient: 0.5
                    },
                    clampToGround: false
                }
            }
        },
        isFlowLinesExist: {
            type: Boolean
        },
        isflowLinesShow: {
            type: Boolean
        }
    },
    data() {
        return {};
    },
    created() {
    },
    mounted() {
        this.$nextTick(() => {
            this.viewer = findComponentUpward(this,"cesiumViewer").viewer;
            // this.addFlowlines();
            
        });
    },
    methods: {
        async createFlowlines() {
            let roadData = await this.getData(this.url);
            let len = roadData.length;
            let primitiveCollection = new PrimitiveCollection({show: false});
            const that = this
            for(let i = 1; i < len; i++) {
                let flowLineOptions = {
                    positions: roadData[i],
                    width: 5,
                    style: {
                        color: new Color(Math.random() * 0.5 + 0.5, Math.random() * 0.8 + 0.2, 0.0, 1.0),
                        speed: 7,
                        percent: 0.02,
                        gradient: 0.5
                    },
                    clampToGround: false
                }
                if(typeof(that.options.width) !== "undefined") {
                    flowLineOptions.width = that.options.width
                }
                if(typeof(that.options.clampToGround) !== 'undefined') {
                    flowLineOptions.clampToGround = that.options.clampToGround
                }
                flowLineOptions.style = Object.assign(flowLineOptions.style, that.options.style)
                let flowLine = new FlowLinePrimitive(primitiveCollection,flowLineOptions);
            }
            primitiveCollection.show = true;
            console.log(primitiveCollection)
            return primitiveCollection;
        },
        async getData() {
            if(this.url) {
                let data = await getPublicData(this.url)
                console.log(data)
                let roadsList = data.features;
                let len = roadsList.length;
                let dataList = [];
                
                for(let i = 0; i < len; i++){
                
                    let roadNodes = roadsList[i].geometry.coordinates
                    let nodeLen = roadNodes.length;
                    let cartesians = [];
                    for(let j = 0; j < nodeLen; j++) {
                        cartesians.push(roadNodes[j][0]);
                        cartesians.push(roadNodes[j][1]);
                    }
                    cartesians = Cartesian3.fromDegreesArray(cartesians);
                    dataList.push(cartesians)
                    
                    
                }
                return dataList;
            }
            
        },
        async addFlowlines () {
            let url = this.dataUrl;
            let primitiveCollection = await this.createFlowlines(url);
            this.primitiveCollection = primitiveCollection
            console.log(primitiveCollection);
            this.viewer.scene.primitives.add(this.primitiveCollection);
            console.log(this.viewer.scene.primitives)
        },
        removeFlowlines() {
            this.viewer.scene.primitives.remove(this.primitiveCollection);
        },
        showFlowlines() {
            if(this.primitiveCollection) {
                this.primitiveCollection.show = true
            }
        },
        hideFlowlines() {
            if(this.primitiveCollection) {
                this.primitiveCollection.show = false
            }
        } 
    },
    computed: {
        // ...mapGetters({
        //     isflowLinesExist: 'isflowLinesExist',
        //     isflowLinesShow: 'isflowLinesShow'
        // })
    },
    watch: {
        isFlowLinesExist: {
            handler(newValue) {
                if(newValue === true) {
                    this.addFlowlines()
                }else if(newValue === false) {
                    this.removeFlowlines()
                }
            }
        },
        isflowLinesShow: {
            handler(newValue) {
                if(newValue === true) {
                    this.showFlowlines()
                }else if(newValue === false) {
                    this.hideFlowlines()
                }
            }
        }
    }

}
</script>

<style lang='scss' scoped>
</style>
