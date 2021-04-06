const state= {
      dialogVisible:false,
      dataId:''
    }
const mutations= {
    SETDIALOGVISIBLE: (state, dialogVisible) => {
        state.dialogVisible = dialogVisible
    },
    SETDATAID: (state, dataId) => {
        state.dataId = dataId
    },
}
const getters= {
    dialogVisible: state => state.dialogVisible,
    dataId: state => state.dataId
}
const actions= {}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}