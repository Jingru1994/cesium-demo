<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
// import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import * as TWEEN from "@tweenjs/tween.js";

import Popup from "@/utils/widgets/Popup1/Popup.js";

export default {
  name: "ThreeDeviceControl",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.prevTime = 0;
    this.interval = 0;
    this.depth = 0.5; //拉伸地图的厚度
    this.clock = new THREE.Clock();
    this.clock.autoStart = true;

    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();

    this.loadModels();

    this.cameraAnimation();
    this.addClickListener();
    this.pickObject();

    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }

    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.scene.traverse(item => {
      if (item.isMesh || item instanceof THREE.Sprite) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
          });
        } else {
          item.material.dispose();
        }
      }
    });
    THREE.Cache.clear();
    this.scene.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  },
  methods: {
    addClickListener() {
      this.labelRenderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.background = new THREE.Color(0xeeeeee);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      this.camera = camera;

      //调整camera视角
      camera.position.set(0, 0, 500);

      // 避免模型很模糊的现象
      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvasPixelWidth = canvas.width / window.devicePixelRatio;
      let canvasPixelHeight = canvas.height / window.devicePixelRatio;
      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      window.addEventListener("resize", this.onWindowResize);
    },
    addState() {
      let state = new Stats();
      this.state = state;
      const container = document.querySelector(".three-view");
      container.appendChild(state.dom);
    },
    initControls(renderer) {
      let controls;
      if (renderer) {
        controls = new OrbitControls(this.camera, renderer.domElement);
        // controls = new TrackballControls(this.camera, renderer.domElement)
      } else {
        controls = new OrbitControls(this.camera, this.renderer.domElement);
        // controls = new TrackballControls(this.camera, this.renderer.domElement)
      }
      controls.enableDamping = true;
      // controls.rotateSpeed = 5.0
      // controls.zoomSpeed = 2.0
      // controls.panSpeed = 1.0
      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      //光源位置
      dirLight.position.set(100, 100, 100);
      this.scene.add(dirLight);
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      let delta = this.clock.getDelta();

      this.renderer.render(this.scene, this.camera);
      if (this.labelRenderer) {
        this.labelRenderer.render(this.scene, this.camera);
      }

      this.controls.update(delta);

      TWEEN.update();
      this.mixer && this.mixer.update(delta);

      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async loadModels() {
      let model = await this.loadGLTFModel("model/lab/lab.gltf");
      model.visible = true;
      this.scene.add(model);
      this.factory = model;
    },
    loadGLTFModel(url) {
      const p = new Promise(resolve => {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          url,
          gltf => {
            const model = gltf.scene || gltf.scene[0];
            const clips = gltf.animations || [];

            if (!this.scene) {
              // Valid, but not supported by this viewer.
              throw new Error(
                "This model contains no scene, and cannot be viewed here. However," +
                  " it may contain individual 3D resources."
              );
            }

            model.traverse(function(o) {
              if (o.isMesh) {
                let material = o.material.clone();
                o.material = material;
              }
            });

            this.setContent(model, clips);

            resolve(model);
          },
          xhr => {
            // called while loading is progressing
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            this.loadPercentage = Number(
              ((xhr.loaded / xhr.total) * 100).toFixed(0)
            );
          },
          error => {
            // called when loading has errors
            console.error("An error happened", error);
          }
        );
      });
      return p;
    },
    setContent(object, clips) {
      this.clear();

      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      this.controls.reset();

      object.position.x += object.position.x - center.x;
      object.position.y += object.position.y - center.y;
      object.position.z += object.position.z - center.z;
      this.controls.maxDistance = size * 10;
      this.camera.near = size / 100;
      this.camera.far = size * 100;
      this.camera.updateProjectionMatrix();

      this.camera.position.copy(center);
      this.camera.position.x += size / 3.0;
      this.camera.position.y += size / 7.5;
      this.camera.position.z += size / 1.5;
      this.camera.lookAt(center);
      this.controls.saveState();

      this.content = object;

      this.content.traverse(node => {
        // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
        if (node.isMesh) {
          node.material.depthWrite = !node.material.transparent;
        }
      });
      this.setClips(clips);

      console.info("[glTF Viewer] THREE.Scene exported as `window.content`.");
    },
    clear() {
      const MAP_NAMES = [
        "map",
        "aoMap",
        "emissiveMap",
        "glossinessMap",
        "metalnessMap",
        "normalMap",
        "roughnessMap",
        "specularMap"
      ];

      if (!this.content) return;

      this.scene.remove(this.content);

      // dispose geometry
      this.content.traverse(node => {
        if (!node.isMesh) return;

        node.geometry.dispose();
      });

      // dispose textures
      this.traverseMaterials(this.content, material => {
        MAP_NAMES.forEach(map => {
          if (material[map]) material[map].dispose();
        });
      });
    },
    traverseMaterials(object, callback) {
      object.traverse(node => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach(callback);
      });
    },
    setClips(clips) {
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer.uncacheRoot(this.mixer.getRoot());
        this.mixer = null;
      }

      this.clips = clips;
      if (!clips.length) return;

      this.mixer = new THREE.AnimationMixer(this.content);
      this.mixer.addEventListener("loop", function(e) {
        e.action.paused = true;
      });

      this.clips.forEach(clip => {
        clip.tracks.splice(20, 12);

        let leftClip = clip.clone();
        leftClip.tracks.splice(2, 10);

        let rightClip = clip.clone();
        rightClip.tracks.splice(13, 7);
        rightClip.tracks.splice(0, 2);

        const leftAction = this.mixer.clipAction(leftClip);
        leftAction.setLoop(THREE.LoopRepeat).play();
        leftAction.paused = true;
        const rightAction = this.mixer.clipAction(rightClip);
        rightAction.setLoop(THREE.LoopRepeat);
        rightAction.paused = true;
        this.actions = {
          Object_124: leftAction,
          Object_148: rightAction
        };
      });
    },
    pickObject() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;
      this.labelRenderer.domElement.addEventListener(
        "mousemove",
        onPointerMove
      );
      this.labelRenderer.domElement.addEventListener("click", onPointerClick);
      // this.renderer.domElement.addEventListener('mousemove',onPointerMove)
      // this.renderer.domElement.addEventListener('click',onPointerClick)
      const selectObjects = ["Object_124", "Object_148"];
      function onPointerMove(event) {
        let mouse = new THREE.Vector2();
        if (event.isPrimary === false) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, that.camera);
        const intersects = raycaster.intersectObject(that.factory, true);
        // const intersects = raycaster.intersectObject()

        if (intersects.length > 0) {
          if (selectObjects.includes(intersects[0].object.name)) {
            if (selectedObject && selectedObject !== intersects[0].object) {
              selectedObject.material.color.set(selectedObject.currentColor);
            }
            if (!selectedObject || selectedObject !== intersects[0].object) {
              selectedObject = intersects[0].object;
              selectedObject.currentColor = selectedObject.material.color.getStyle();
              selectedObject.material.color.set("#ff5e61");
            }
          } else {
            if (selectedObject) {
              selectedObject.material.color.set(selectedObject.currentColor);
            }

            selectedObject = null;
          }
        } else {
          if (selectedObject) {
            selectedObject.material.color.set(selectedObject.currentColor);
          }

          selectedObject = null;
        }
      }
      function onPointerClick() {
        if (
          selectedObject &&
          selectedObject.name &&
          selectObjects.includes(selectedObject.name)
        ) {
          if (that.actions[selectedObject.name].paused) {
            that.actions[selectedObject.name].paused = false;
            that.actions[selectedObject.name].play();
          } else {
            that.actions[selectedObject.name].paused = true;
          }
        }
      }
    },
    cameraAnimation() {
      const container = document.querySelector(".three-view");
      let popup = new Popup(this.scene, this.camera, container);
      let labelRenderer = popup.getCSS2DRenderer();
      this.labelRenderer = labelRenderer;
      this.initControls(labelRenderer);

      const that = this;
      const tween1 = new TWEEN.Tween(that.controls.target)
        .delay(3000)
        .to(
          {
            x: 1.0169825649746964,
            y: -0.6911753387875544,
            z: -0.4255155140638133
          },
          3000
        )
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
        .onStart(function() {
          new TWEEN.Tween(that.camera.position)
            .to(
              {
                x: 2.3106228148626595,
                y: 0.01659965839722677,
                z: 1.7890680865688264
              },
              3000
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
          new TWEEN.Tween(that.camera.rotation)
            .to(
              {
                x: -0.30933763162902417,
                y: 0.5077586743913431,
                z: 0.15416160517887822
              },
              3000
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        });
      const tween2 = new TWEEN.Tween(that.controls.target)
        .to({ x: -0.5, y: 0, z: -0.6 }, 2000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onStart(function() {
          new TWEEN.Tween(that.camera.position)
            .to(
              {
                x: -0.16848833511087863,
                y: 0.07267978846745511,
                z: -0.12717112239346018
              },
              2000
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        });
      const tween3 = new TWEEN.Tween(that.camera.position)
        .to(
          {
            x: -0.3132944104560116,
            y: 0.08041758759218391,
            z: -0.054634510124828894
          },
          1000
        )
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
          buttonLabel();
        });

      tween1.chain(tween2);
      tween2.chain(tween3);

      function buttonLabel() {
        const object = that.scene.getObjectByName("Object_148");
        object.label = "点击按钮控制玻璃面板";
        popup.addTo(object);

        const label = popup.label;
        console.log(label);
        label.position.z = label.position.z - 1.5;
        label.position.y = label.position.y + 0.1;

        let m = 0;
        const interval = setInterval(function() {
          if (label.element.style.opacity === "0") {
            label.element.style.opacity = 1;
          } else {
            label.element.style.opacity = 0;
          }

          if (m === 4) {
            clearInterval(interval);
          }
          m++;
        }, 1000);
      }
    }
  }
};
</script>

<style lang="scss">
#app {
  overflow: hidden;
}
.three-view {
  #three {
    width: 100%;
    height: 100%;
  }
}
</style>
