import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
/**
 * 加载模型，支持gltf，glb，darco处理后的glb，fbx，obj格式模型
 *
 * @param {Object} options 选项。
 * @param {String} options.modelUrl 模型地址。
 * @param {String} [options.materialUrl] 纹理地址，若模型为obj格式，需提供mtl文件地址。
 * @param {String} [options.type] 类型，若模型为darco处理后的glb，需将type设置为darco。
 * @param {Function} [options.getLoadPercent] 可获得模型加载进度回调函数。
 */
async function loadModel(options) {
  if (!options) {
    throw Error("Using loadModels must provide options");
  }
  const modelUrl = options.modelUrl;
  const materialUrl = options.materialUrl;
  const type = options.type;
  const callback = options.getLoadPercent;
  let extension = modelUrl.split(".");
  extension = extension[extension.length - 1];
  let model;
  switch (extension) {
    case "glb":
      if (type === "draco") {
        model = await loadDracoGLTFModel(modelUrl, callback);
      } else {
        model = await loadGLTFModel(modelUrl, callback);
      }
      break;
    case "gltf":
      if (type === "draco") {
        model = await loadDracoGLTFModel(modelUrl, callback);
      } else {
        model = await loadGLTFModel(modelUrl, callback);
      }
      break;
    case "obj":
      model = await loadOBJModel(modelUrl, materialUrl, callback);
      break;
    case "fbx":
      model = await loadFBXModel(modelUrl, callback);
      break;
  }
  return model;
}
function loadGLTFModel(url, callback) {
  const p = new Promise(resolve => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      url,
      gltf => {
        let model = gltf.scene;
        model.traverse(o => {
          //让模型等每个部分都能产生阴影
          if (o.isMesh) {
            o.castShadow = true;
          }
        });
        resolve(model);
      },
      xhr => {
        // called while loading is progressing
        const loadPercentage = Number(
          ((xhr.loaded / xhr.total) * 100).toFixed(0)
        );
        typeof callback === "function" && callback(loadPercentage);
      },
      error => {
        // called when loading has errors
        console.error("An error happened", error);
      }
    );
  });
  return p;
}
function loadDracoGLTFModel(url, callback) {
  const p = new Promise(resolve => {
    let loader = new GLTFLoader();
    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("libs/draco/gltf/"); //设置解压库文件路径
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      url,
      gltf => {
        // called when the resource is loaded
        let model = gltf.scene;
        model.traverse(o => {
          //让模型等每个部分都能产生阴影
          if (o.isMesh) {
            o.castShadow = true;
          }
        });
        resolve(model);
      },
      xhr => {
        // called while loading is progressing
        const loadPercentage = Number(
          ((xhr.loaded / xhr.total) * 100).toFixed(0)
        );
        typeof callback === "function" && callback(loadPercentage);
      },
      error => {
        // called when loading has errors
        console.error("An error happened", error);
      }
    );
  });
  return p;
}
function loadOBJModel(modelUrl, materialUrl, callback) {
  const p = new Promise(resolve => {
    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(materialUrl, materials => {
      // 返回一个包含材质的对象MaterialCreator
      //obj的模型会和MaterialCreator包含的材质对应起来
      loader.setMaterials(materials);
      loader.load(
        modelUrl,
        // called when resource is loaded
        object => {
          const model = object;
          model.traverse(o => {
            //让模型等每个部分都能产生阴影
            if (o.isMesh) {
              o.castShadow = true;
            }
          });
          resolve(model);
        },
        xhr => {
          // called while loading is progressing
          const loadPercentage = Number(
            ((xhr.loaded / xhr.total) * 100).toFixed(0)
          );
          typeof callback === "function" && callback(loadPercentage);
        },
        error => {
          // called when loading has errors
          console.error("An error happened", error);
        }
      );
    });
  });
  return p;
}
function loadFBXModel(url, callback) {
  const p = new Promise(resolve => {
    const loader = new FBXLoader();
    loader.load(url, object => {
      const model = object;
      resolve(model);
    }),
      xhr => {
        // called while loading is progressing
        const loadPercentage = Number(
          ((xhr.loaded / xhr.total) * 100).toFixed(0)
        );
        typeof callback === "function" && callback(loadPercentage);
      },
      error => {
        // called when loading has errors
        console.error("An error happened", error);
      };
  });
  return p;
}

export default loadModel;
