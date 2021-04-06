const state= {
    isflowLinesExist: false,
    isflowLinesShow: true
}
const mutations= {
    SET_FLOWLINESEXIST: (state, isflowLinesExist) => {
        state.isflowLinesExist = isflowLinesExist
    },
    SET_FLOWLINESSHOW: (state, isflowLinesShow) => {
        state.isflowLinesShow = isflowLinesShow
    },
}
const getters= {
    isflowLinesExist: state => state.isflowLinesExist,
    isflowLinesShow: state => state.isflowLinesShow
}
const actions= {}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}