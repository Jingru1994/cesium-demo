<template>
  <div class="detail-example">
      <div class="detail-div">{{detailName}}</div>
  </div>
  
</template>

<script>

export default {
  name: "detail",
  data() {
    return {
        detailName: ""
    };
  },
  created() {
    // this.init();
  },
  mounted() {
    console.log("#####################");
      this.detailName = this.$route.query.data;
      console.log(this.detailName);
  },
  beforeDestroy() {},
  methods: {

  }
};
</script>

<style lang='scss' scoped>
.detail-example {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  .detail-div {
    font-size: 16px;
  }
}
</style>