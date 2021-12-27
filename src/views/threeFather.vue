<template>
  <div class="father-componet">
    <three-svg :saleList="saleList"> </three-svg>
    <button class="button1" @click="buttonClick">anniu</button>
  </div>
</template>

<script>
import threeSvg from "@/views/threeSvg.vue";
import exampleData from "@/utils/saleData.js";
export default {
  components: { threeSvg },
  data() {
    return {
      saleList: exampleData
    };
  },
  mounted() {
    // setTimeout(this.changeData(), 100000);
  },
  methods: {
    changeData() {
      this.saleList[0].name = "北京1";
    },
    buttonClick() {
      this.saleList[0].sales = "9.999";
    }
  }
};
</script>

<style>
.button1 {
  position: absolute;
  top: 0px;
  left: 0px;
  color: aliceblue;
}
</style>
