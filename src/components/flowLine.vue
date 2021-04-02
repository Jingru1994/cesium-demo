<template>
    <div class="flow-line"></div>
</template>

<script>
import GeometryInstance from 'cesium/Core/GeometryInstance.js'

import {findComponentUpward} from "@/utils/assist.js"
import {getPublicData} from "@/api/requestData.js";


export default {
    name: "flow-line",
    props: {
        url: {
            type: String
        },
        roadStyle: {
            type: Object
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
            this.addEntityText();
            
        });
    },
    methods: {
        async getData(url) {
            let data = await getPublicData(url)
            console.log(data)
            debugger
            let roadList = data.features;
            let len = tmpList.length;
            let dataList = [];
            
            for(let i = 0; i < len; i++){
                let roadNodes = roadList[i].properties.coordinates
                let nodeLen = roadNodes.length;
                let cartesians = [];
                for(let j = 0; j < nodeLen; j++) {
                    cartesians.push(cartesians[i][0]);
                    cartesians.push(cartesians[i][1]);
                }
                cartesians = Cartesian3.fromDegreesArray(cartesians);
                dataList.push(roadList.properties.coordinates)
            }
            return dataList;
        },
    }
}
</script>

<style lang='scss' scoped>
</style>
