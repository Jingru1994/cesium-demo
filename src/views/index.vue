<template>
    <div class="demo-index">
        <div class="header">3D Demo</div>
        <div class="container">
            <el-row class="total-container">
                <el-col class="menu-container">
                    <sider-bar
                        :menu-data="examplesData"
                        default-active="model"
                        @on-menu-select="selectMenuHandler">
                    </sider-bar>

                </el-col>
                <el-col class="example-container" >
                    <example-list :examples-data="examplesData"></example-list>
                </el-col>

            </el-row>
        </div>
    </div>
</template>

<script>
import ExampleList from '@/components/Index/ExampleList.vue'
import SiderBar from '@/components/SiderBar/index.vue'
import {getPublicData} from "@/api/requestData.js";
export default {
    components: {
        ExampleList,
        SiderBar
    },
    data() {
        return {
            examplesData: []
        }
    },
    methods: {
    selectMenuHandler(value) {
        console.log(value)
      if (value) {
        let el = document.getElementById('nav-' + value)
        console.log(el)
        if (el) {
            document.querySelector('.example-container').scrollTop = el.offsetTop - 15
        }
      }
    },
        async getExamplesData() {
            let data = await getPublicData('config/examples.json');
            this.examplesData = data;
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.getExamplesData()
             console.log(document.querySelector('.example-container').scrollTop)
        })
  }
}
</script>

<style lang='scss' scoped>
p {
    margin: 0;
    padding: 0;
}
.demo-index{
    height: 100%;
    .header{
        font-size: 26px;
        font-weight: 900;
        height: 60px;
        line-height: 60px;
        padding: 0 20px;
        background-color: #001748;
        color: #ffffff;
        text-align: left;
    }
    .container{
        height: calc(100% - 60px);
        background-color: #f7f8fa;
        .total-container{
            padding-left: 20px;
            height: 100%;  
            
        }
        .menu-container{
            height: calc(100% - 40px);
            padding-top: 20px;
            padding-left: 10px;
            margin-top: 20px;
            background: #fff;
            -webkit-box-shadow: 2px 2px 2px #c1c1c1;
            box-shadow: 2px 2px 2px #c1c1c1;
            border-radius: 10px;
        }
        .example-container {
            padding: 30px;
            height: 100%;
            overflow-y: auto;
        }
        @media only screen and (max-width: 1199px){
            .menu-container {
                display: none!important;
            }
        }
        @media only screen and (min-width: 1200px){
            .menu-container {
                width: 12.5%;
            }
            .example-container {
                width: calc(100% - 12.5%);
            }
        }

        
    }
}

    




</style>