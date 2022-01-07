/*
 * @Author: your name
 * @Date: 2021-02-05 16:15:17
 * @LastEditTime: 2021-03-02 16:49:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\api\requestGeojson.js
 */
import axios from "axios";

export function getPublicData(name) {
  // console.log(process.env.BASE_URL);
  // console.log( window.location.pathname);
  let prefix =
    process.env.NODE_ENV === "production" ? window.location.pathname : "";
  console.log(prefix);
  return axios.get(`${name}`).then(data => {
    if (data.data) {
      return Promise.resolve(data.data);
    }
    return Promise.reject({
      returnCode: -1
    });
  });
}

export function toGeojson(json) {
  let features = json;
  let elements = [];
  for (let i = 0; i < features.length; i++) {
    let out_feature = {};
    out_feature["type"] = "Feature";
    out_feature["properties"] = {};
    for (let property in features[i]) {
      out_feature["properties"][property] = features[i][property];
    }
    out_feature["geometry"] = {};
    out_feature["geometry"]["type"] = "Point";
    out_feature["geometry"]["coordinates"] = [
      parseFloat(features[i]["j"]),
      parseFloat(features[i]["w"])
    ];
    elements.push(out_feature);
  }
  let final_json = {
    type: "FeatureCollection",
    name: "tmp",
    features: elements
  };
  return final_json;
}
