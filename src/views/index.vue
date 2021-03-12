<template>
    <div class="demo-index">
        <div class="header">Cesium Demo</div>
        <div class="content">
            <div class="row el-row"></div>
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
    .content{
        height: calc(100% - 60px);
        .row.el-row{
            padding: 0 20px;
            height: 100%;
        }
    }
}

    




</style>