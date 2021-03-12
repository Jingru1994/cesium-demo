/*
 * @Author: your name
 * @Date: 2021-02-05 16:15:17
 * @LastEditTime: 2021-03-02 16:49:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\api\requestGeojson.js
 */
import axios from 'axios'

export function  getPublicData(name) {
    console.log(process.env.BASE_URL);
    console.log( window.location.pathname);
    let prefix = process.env.NODE_ENV === "production" ? window.location.pathname : "";
    return axios.get(prefix + `${name}`).then((data)=>{
        console.log(data);
        if(data.data){
            return Promise.resolve(data.data)
        }
        return Promise.reject({
            returnCode :-1
        })
    })
}