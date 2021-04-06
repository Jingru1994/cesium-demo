import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dialogVisible:false,
    dataId:''
  },
  mutations: {
    SETDIALOGVISIBLE: (state, dialogVisible) => {
      state.dialogVisible = dialogVisible
    },
    SETDATAID: (state, dataId) => {
      state.dataId = dataId
    },
  },
  getters: {
    dialogVisible: state => state.dialogVisible,
    dataId: state => state.dataId
  },
  actions: {},
  modules: {}
});