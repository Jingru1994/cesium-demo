<!--
 * @Author: your name
 * @Date: 2021-03-21 09:57:17
 * @LastEditTime: 2021-03-21 10:53:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\views\index.vue
-->
<template>
    <div class="demo-index">
        <div class="header">Cesium Demo</div>
        <div class="container">
            <el-row class="example-container">
                <el-col class="menu-container">

                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style lang='scss' scoped>
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
        .example-container{
            padding: 0 20px;
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
        @media only screen and (max-width: 1199px){
            .menu-container {
                display: none!important;
            }
        }
        @media only screen and (min-width: 1200px){
            .menu-container {
                width: 12.5%;
            }
        }

        
    }
}

    




</style>