<template>
  <div class="cesium-index">
      <cesium-viewer>
        <primitive-tileset></primitive-tileset>
        <primitive-tileset></primitive-tileset>
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
        :visible.sync="isDialogVisible"
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
import cesiumViewer from "@/components/cesiumViewer.vue";
import primitiveTileset from "@/components/primitiveTileset.vue";
import { mapMutations , mapGetters } from "vuex";


export default {
  name: "CesiumScene",
  components: {
      cesiumViewer,
      primitiveTileset
  },
  data() {
    return {
      isDialogVisible: false,
      type:"tiles"
    };
  },
  mounted() {
      
  },
  beforeDestroy() {},
  computed: {
    ...mapGetters({
      dialogVisible:'dialogVisible',
      dataId: "dataId"
      // ...
    })
  },
  methods: {
    ...mapMutations({
      setDialogVisible: 'SETDIALOGVISIBLE' 
    }),
    closeDialog(){
      this.setDialogVisible(false)
    },
  },
  watch:{
    dialogVisible: function(newValue){
      console.log(newValue);
      this.isDialogVisible = newValue;
    }
  }
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