import axios from 'axios'
axios.defaults.withCredentials = false
const service = axios.create({
    baseURL: '/', // api 的 base_url
    timeout: 60000, // request timeout,
    withCredentials: false
})

// request interceptor
service.interceptors.request.use(
    config => {
        // Do something before request is sent
        // if (store.getters.token) {
        //   // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
        //   config.headers['X-Token'] = getToken()
        // }
        return config
    },
    error => {
        console.log(error)
        // Do something with request error
        // Promise.reject(error)
        Promise.resolve({})
    }
)

// response interceptor
service.interceptors.response.use(
    response => response.data,
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)

export default service




/* import request from '@/utils/request'

//使用
export function getInfo(params) {
  return request({
    url: '/user/info',
    method: 'get',
    params
  });
}
 */
