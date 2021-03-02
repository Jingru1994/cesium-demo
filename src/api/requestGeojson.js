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
    return axios.get(process.env.BASE_URL + `${name}`).then((data)=>{
        console.log(data);
        debugger;
        if(data.data){
            return Promise.resolve(data.data)
        }
        return Promise.reject({
            returnCode :-1
        })
    })
}