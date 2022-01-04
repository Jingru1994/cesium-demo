<template>
  <div class="three-view">
    <canvas id="three"></canvas>
    <div class="timeline">
      <div class="point-list">
        <div class="assist-container">
          <div
            v-for="point in pointList"
            :key="point.id"
            class="point"
            :class="{ active: point.id === currentIndex }"
            @mouseover="change(point.id)"
          ></div>
        </div>
      </div>
      <div class="line"></div>
    </div>
    <div class="progress" v-show="isActive">
      <!-- <div class="progress"> -->
      <div class="progress-text">{{ currentModel }}:</div>
      <el-progress
        class="progress-bar"
        :percentage="loadPercentage"
      ></el-progress>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
// import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";
// import { UniformsLib } from "three/src/renderers/shaders/UniformsLib.js";

export default {
  name: "ThreeModelView",
  data() {
    return {
      pointList: [
        {
          time: "First Period",
          id: 0
        },
        {
          time: "Second Period",
          id: 1
        },
        {
          time: "Third Period",
          id: 2
        }
      ],
      currentIndex: 0,
      timer: "",
      modelUrls: [
        "/model/vase-1.glb",
        "/model/compressor.glb",
        "/model/vase-2.glb"
      ],
      yOffset: -40.0,
      loadPercentage: 0,
      isActive: true,
      currentModel: ""
    };
  },
  created() {
    this.models = [];
    this.$nextTick(() => {});
  },
  async mounted() {
    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();
    // this.loadOBJModel();
    this.loadGLTFModel("/model/地图测试/Untitled.gltf");
    // this.loadModels();
    this.animate();
    // this.loadFBXModel()
    this.addClickListener();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.animate);
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
  watch: {
    currentIndex: {
      handler: function(newVal, oldVal) {
        if (this.models.length === 3) {
          this.models[oldVal].visible = false;
          this.models[newVal].visible = true;
        }
      }
    }
  },
  methods: {
    addClickListener() {
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.background = new THREE.Color(0xa0a0a0);
      // scene.fog = new THREE.Fog("#04613b", 300, 500);
      // scene.fog = new THREE.Fog( 0x04613b, 300, 500);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      this.camera = camera;
      camera.position.set(
        250.66260682992876,
        -23.24176248772048,
        -49.1537904128702
      ); //camera默认放在中心点(0,0,0)，挪一下位置

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

      // // 加载背景图片
      var textureLoader = new THREE.TextureLoader();
      var texture = textureLoader.load("/images/threeBackground.png");
      // 纹理对象Texture赋值给场景对象的背景属性.background
      scene.background = texture;
      //   const material = new THREE.MeshBasicMaterial({
      //     map: texture
      //   });
      this.addGround();
      this.addCircle();
    },
    addState() {
      let state = new Stats();
      this.state = state;
      const container = document.querySelector(".three-view");
      container.appendChild(state.dom);
    },
    addCircle() {
      let explosionTexture = new THREE.TextureLoader().load(
        "/images/circle.png"
      );
      explosionTexture.flipY = false;
      const material = new THREE.MeshBasicMaterial({
        map: explosionTexture,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.CircleGeometry(25, 32);
      // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
      const circle = new THREE.Mesh(geometry, material);
      this.circle = circle;
      circle.material.transparent = true;
      this.scene.add(circle);
      circle.rotation.x = -Math.PI / 2;
      circle.position.y = this.yOffset + 2;
    },
    addGround() {
      const grid = new THREE.GridHelper(1000, 100, "#0bcf9d", "#0bcf9d");
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      grid.position.y = this.yOffset;
      this.scene.add(grid);

      // ground
      const texture = new THREE.TextureLoader().load("images/world2.png");
      const texture1 = new THREE.TextureLoader().load("bumpMap.png");
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(819, 409),
        new THREE.MeshPhongMaterial({
          transparent: true,
          // depthWrite: false,
          map: texture,
          bumpMap: texture1,
          bumpScale: 10
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = this.yOffset;

      //自定义材质-渐变色，但是没有阴影
      //   let groundMaterial = new THREE.ShaderMaterial({
      //     // fog: true,//是否受全局雾化影响
      //     // lights: true,
      //     uniforms: {
      //       color1: {
      //         value: new THREE.Color("#046A3B")
      //       },
      //       color2: {
      //         value: new THREE.Color("#022A29")
      //       }
      //     },
      //     vertexShader: `
      //                 varying vec2 vUv;
      //                 void main() {
      //                     vUv = uv;
      //                     gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      //                 }
      //             `,
      //     fragmentShader: `
      //                 uniform vec3 color1;
      //                 uniform vec3 color2;

      //                 varying vec2 vUv;

      //                 void main() {
      //                     gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      //                 }
      //             `
      //     // wireframe: true
      //   });
      //渐变颜色有阴影，不受fog影响
      //THREE.ShaderChunk three内置着色器片段
      //   let groundMaterial2 = new THREE.ShaderMaterial({
      //     // fog: true,
      //     lights: true,
      //     uniforms: THREE.UniformsUtils.merge([
      //       THREE.UniformsLib["lights"],
      //       {
      //         opacity: { type: "f", value: 1.0 }
      //       },
      //       {
      //         color1: { value: new THREE.Color("#046A3B") }
      //       },
      //       {
      //         color2: { value: new THREE.Color("#022A29") }
      //       },
      //       {
      //         shadowPower: { value: 0.5 }
      //       }
      //     ]),
      //     vertexShader: [
      //       "varying vec2 vUv;",
      //       THREE.ShaderChunk["common"],
      //       // THREE.ShaderChunk[ "packing" ],
      //       THREE.ShaderChunk["bsdfs"],
      //       THREE.ShaderChunk["shadowmap_pars_vertex"],
      //       "void main() {",
      //       "vUv = uv;",
      //       THREE.ShaderChunk["beginnormal_vertex"],
      //       THREE.ShaderChunk["defaultnormal_vertex"],

      //       THREE.ShaderChunk["begin_vertex"],
      //       THREE.ShaderChunk["project_vertex"],
      //       THREE.ShaderChunk["worldpos_vertex"],
      //       THREE.ShaderChunk["shadowmap_vertex"],
      //       "}"
      //     ].join("\n"),
      //     fragmentShader: [
      //       THREE.ShaderChunk["common"],
      //       THREE.ShaderChunk["packing"],
      //       THREE.ShaderChunk["bsdfs"],
      //       THREE.ShaderChunk["lights_pars_begin"],
      //       THREE.ShaderChunk["shadowmap_pars_fragment"],
      //       THREE.ShaderChunk["shadowmask_pars_fragment"],
      //       "uniform float opacity;",
      //       "uniform vec3 color1;",
      //       "uniform vec3 color2;",
      //       "uniform float shadowPower;",
      //       "varying vec2 vUv;",
      //       "void main() {",
      //       // mix(x,y,a) 返回x和y的线性混合，即x*(1-a)+y*a  vec3
      //       // "   gl_FragColor = vec4(mix(color1, color2, vUv.y)*getShadowMask(), 1.0);",//纯黑色阴影
      //       "   gl_FragColor = vec4(mix(color1, color2, vUv.y)*(getShadowMask()==0.0?shadowPower:1.0), 1.0);", //与背景色融合的阴影,shadowPower调节阴影黑度
      //       // "   gl_FragColor = vec4(mix(color1, color2, (1 - getShadowMask())*shadowPower), 1.0);",//与背景色融合的阴影，但不是渐变色了，color1板的颜色，color2阴影颜色
      //       // "	vec4 ambient = vec4(0.2, 0.2, 0.2, 1.0);",
      //       // "	vec3 col = vec3(1.0, 1.0, 0.5) * getShadowMask();",
      //       // "	gl_FragColor = ambient + vec4(col, opacity);",
      //       "}"
      //     ].join("\n")
      //   });

      //渐变颜色有阴影，且受fog影响
      // let groundMaterial3 = new THREE.ShaderMaterial({
      //   fog: true,
      //   lights: true,
      //   uniforms: THREE.UniformsUtils.merge([
      //     THREE.UniformsLib["lights"],
      //     {
      //       opacity: { type: "f", value: 1.0 }
      //     },
      //     {
      //       color1: { value: new THREE.Color("#046A3B") }
      //     },
      //     {
      //       color2: { value: new THREE.Color("#022A29") }
      //     },
      //     {
      //       shadowPower: { value: 0.5 }
      //     },
      //     {
      //       fogColor: { type: "c", value: this.scene.fog.color }
      //     },
      //     {
      //       fogNear: { type: "f", value: this.scene.fog.near }
      //     },
      //     {
      //       fogFar: { type: "f", value: this.scene.fog.far }
      //     }
      //   ]),
      //   vertexShader: [
      //     "varying vec2 vUv;",
      //     "varying vec3 vPosition;",
      //     THREE.ShaderChunk["common"],
      //     // THREE.ShaderChunk[ "packing" ],
      //     THREE.ShaderChunk["bsdfs"],
      //     THREE.ShaderChunk["shadowmap_pars_vertex"],
      //     "void main() {",
      //     "   vUv = uv;",
      //     "   vPosition = position;",
      //     THREE.ShaderChunk["beginnormal_vertex"],
      //     THREE.ShaderChunk["defaultnormal_vertex"],
      //     THREE.ShaderChunk["begin_vertex"],
      //     THREE.ShaderChunk["project_vertex"],
      //     THREE.ShaderChunk["worldpos_vertex"],
      //     THREE.ShaderChunk["shadowmap_vertex"],
      //     "}"
      //   ].join("\n"),
      //   fragmentShader: [
      //     THREE.ShaderChunk["common"],
      //     THREE.ShaderChunk["packing"],
      //     THREE.ShaderChunk["bsdfs"],
      //     THREE.ShaderChunk["lights_pars_begin"],
      //     THREE.ShaderChunk["shadowmap_pars_fragment"],
      //     THREE.ShaderChunk["shadowmask_pars_fragment"],
      //     "uniform float opacity;",
      //     "uniform vec3 color1;",
      //     "uniform vec3 color2;",
      //     "uniform float shadowPower;",
      //     "varying vec2 vUv;",
      //     "uniform vec3 fogColor;",
      //     "uniform float fogNear;",
      //     "uniform float fogFar;",
      //     "void main() {",
      //     "   gl_FragColor = vec4(mix(color1, color2, vUv.y)*(getShadowMask()==0.0?shadowPower:1.0), 1.0);",
      //     "   #ifdef USE_FOG",
      //     "       #ifdef USE_LOGDEPTHBUF_EXT",
      //     "           float depth = gl_FragDepthEXT / gl_FragCoord.w;",
      //     "       #else",
      //     "           float depth = gl_FragCoord.z / gl_FragCoord.w;",
      //     "       #endif",
      //     //smoothstep(edge1,edge2,x)输出0至1平滑函数
      //     "       float fogFactor = smoothstep( fogNear, fogFar, depth );",
      //     "       gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);",
      //     "   #endif",
      //     "}"
      //   ].join("\n")
      // });

      //具有阴影的材质，报错，不能用，大概是较低版本的thrre
      //与可用的阴影相似，但是引用three内置shader的方式明显不同
      //   let groundMaterial1 = new THREE.ShaderMaterial({
      //     fog: true, //是否受全局雾化影响
      //     lights: true,
      //     uniforms: mergeUniforms([UniformsLib.lights, UniformsLib.fog]),
      //     vertexShader: `
      //                 #include <common>
      //                 #include <fog_pars_vertex>
      //                 #include <shadowmap_pars_vertex>
      //                 void main() {
      //                 #include <begin_vertex>
      //                 #include <project_vertex>
      //                 #include <worldpos_vertex>
      //                 #include <shadowmap_vertex>
      //                 #include <fog_vertex>
      //                 }
      //             `,

      //     fragmentShader: `
      //                 #include <common>
      //                 #include <packing>
      //                 #include <fog_pars_fragment>
      //                 #include <bsdfs>
      //                 #include <lights_pars_begin>
      //                 #include <shadowmap_pars_fragment>
      //                 #include <shadowmask_pars_fragment>
      //                 #include <dithering_pars_fragment>
      //                 void main() {
      //                 // CHANGE THAT TO YOUR NEEDS
      //                 // ------------------------------
      //                 vec3 finalColor = vec3(0, 0.75, 0);
      //                 vec3 shadowColor = vec3(0, 0, 0);
      //                 float shadowPower = 0.5;
      //                 // ------------------------------

      //                 // it just mixes the shadow color with the frag color
      //                 gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);
      //                 #include <fog_fragment>
      //                 #include <dithering_fragment>
      //                 }
      //             `
      //     // wireframe: true
      //   });
      ground.receiveShadow = true;
      // ground.material = groundMaterial3;
      this.scene.add(ground);
    },
    initControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls = controls;
      controls.enableDamping = true;
      // controls.target.y = this.yOffset

      // TrackballControls
      // var clock = new THREE.Clock();
      // var trackballControls = new TrackballControls(camera, renderer.domElement);
      // trackballControls.rotateSpeed = 10.0;
      // trackballControls.zoomSpeed = 10.0;
      // trackballControls.panSpeed = 10.0;
    },
    initLight() {
      this.initAmbientLight();
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff");
      this.scene.add(ambientLight);

      //比较自然的环境光
      // const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
      // hemLight.position.set(200, 100, 200)
      // this.scene.add(hemLight)
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
      //光源位置
      dirLight.position.set(100, 100, 100);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      // let target = new THREE.Object3D()
      // target.position.set(0.0,this.yOffset,0.0)
      dirLight.target = this.circle;
      console.log(dirLight.target);
      dirLight.shadow.camera.near = 100;
      dirLight.shadow.camera.far = 300;
      dirLight.shadow.camera.left = -40;
      dirLight.shadow.camera.right = 40;
      dirLight.shadow.camera.top = 40;
      dirLight.shadow.camera.bottom = -50;
      // dirLight.target.position.set(0,this.yOffset,0)
      this.scene.add(dirLight);
      //显示灯光方向
      // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
      // this.scene.add(debugCamera1)
      //显示阴影
      const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera);
      this.scene.add(debugCamera);
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      this.controls.update();
      // trackballControls.update(clock.getDelta());

      if (this.models.length === this.modelUrls.length) {
        this.speed += 0.01;
        this.models.forEach(model => {
          model.rotation.y += 0.01;
        });
      }
      this.circle.rotation.z += 0.02;
      this.renderer.render(this.scene, this.camera);
      this.state.update();
      requestAnimationFrame(this.animate);
    },
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      var width = window.innerWidth;
      var height = window.innerHeight;
      var canvasPixelWidth = canvas.width / window.devicePixelRatio;
      var canvasPixelHeight = canvas.height / window.devicePixelRatio;

      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      return needResize;
    },
    onWindowResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async loadModels() {
      for (let i = 0; i < this.modelUrls.length; i++) {
        this.currentModel = this.pointList[i].time;
        let model = await this.loadGLTFModel(this.modelUrls[i]);
        this.models.push(model);
        console.log(model);
        if (i === 0) {
          model.visible = true;
        }
      }
      this.isActive = false;
      this.timer = setInterval(() => {
        this.autoPlay();
      }, 4000);
    },
    loadGLTFModel(url) {
      const p = new Promise(resolve => {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          url,
          gltf => {
            let model = gltf.scene;
            model.traverse(o => {
              // 加材质，这里其实不需要
              // if(o.material && o.material.name === "material_0") {
              //     let explosionTexture = new THREE.TextureLoader().load(
              //         '/model/Vase-obj_0.jpg.001.jpg'
              //     )
              //     explosionTexture.flipY = false
              //     const material = new THREE.MeshBasicMaterial({
              //         map: explosionTexture
              //     })
              //     o.material = material
              // }
              //让模型等每个部分都能产生阴影
              if (o.isMesh) {
                o.castShadow = true;
                // o.receiveShadow = true
              }
            });
            this.scene.add(model);
            this.adjustModel(model);
            model.visible = true;
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
    loadDracoGLTFModel() {
      let loader = new GLTFLoader();
      let path = "/model/modelDraco.glb";
      let dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("three/examples/js/libs/draco/gltf/"); //设置解压库文件路径
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        path,
        gltf => {
          // called when the resource is loaded
          console.log(gltf);
          this.scene.add(gltf.scene);
          this.model = gltf.scene;
          return gltf.scene;
        },
        xhr => {
          // called while loading is progressing
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        error => {
          // called when loading has errors
          console.error("An error happened", error);
        }
      );
    },
    loadOBJModel() {
      const loader = new OBJLoader();
      const mtlLoader = new MTLLoader();
      mtlLoader.load("/model/地图测试/Untitled.mtl", materials => {
        // mtlLoader.load("/model/Vase-obj.mtl", materials => {
        // 返回一个包含材质的对象MaterialCreator
        console.log(materials);
        //obj的模型会和MaterialCreator包含的材质对应起来
        loader.setMaterials(materials);
        loader.load(
          // resource URL
          // "/model/guangzhou.obj",
          "/model/地图测试/Untitled.obj",
          // called when resource is loaded
          object => {
            console.log(object);
            this.scene.add(object);
            this.adjustModel(object);
            this.model = object;
            // object.scale.set(10, 10, 10);
            // object.position.set(0, 10, 0);
            return object;
          },
          // called when loading is in progresses
          function(xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          }
        );
      });
    },
    loadFBXModel() {
      const loader = new FBXLoader();
      loader.load("/model/vase2.fbx", object => {
        //动作
        // let mixer = new AnimationMixer( object );
        // const action = mixer.clipAction( object.animations[ 0 ] );
        // action.play();
        console.log(object);
        console.log(object.children[0]);
        // let explosionTexture = new THREE.TextureLoader().load(
        //     '/model/Vase-obj_0.jpg.001.jpg'
        // )
        // explosionTexture.flipY = false
        // const material = new THREE.MeshBasicMaterial({
        //     map: explosionTexture
        // })
        // object.children[0].material = material
        this.scene.add(object.children[0]);
        this.model = object.children[0];
        return object;
      });
    },
    adjustModel(model) {
      //调整模型尺寸
      model.scale.set(0.1, 0.1, 0.1);
      //调整模型中心
      model.traverse(function(o) {
        if (o.isMesh) {
          // o.geometry.computeBoundingBox()
          o.geometry.center();
        }
      });

      //调整模型位置至场景中心
      let bBox = new THREE.Box3();
      bBox.setFromObject(model);
      let mLen = bBox.max.x - bBox.min.x;
      let mWid = bBox.max.z - bBox.min.z;
      let mHei = bBox.max.y - bBox.min.y;
      let x = bBox.min.x + mLen / 2;
      //   let y = bBox.min.y + mHei / 2;
      let z = bBox.min.z + mWid / 2;
      model.position.set(-x, mHei / 2 + this.yOffset, -z);

      let boxHelper;
      boxHelper = new THREE.BoxHelper(model, 0x000000); //显示包围盒

      this.scene.add(boxHelper);

      // model.visible = false
    },
    autoPlay() {
      this.currentIndex++;
      // debugger
      if (this.currentIndex >= this.pointList.length) {
        this.currentIndex = 0;
      }
    },
    change(index) {
      this.currentIndex = index;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.autoPlay();
      }, 4000);
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
  .timeline {
    position: absolute;
    height: 20px;
    width: 100%;
    // background: #fff;
    bottom: 50px;
    text-align: center;
    .line {
      display: inline-block;

      // float: left;
      height: 7px;
      margin: 0 10px;
      width: calc(100% - 1020px);
      background: rgb(67, 97, 163);
    }
    .point-list {
      position: absolute;
      // margin-top: -25px;
      display: inline-block;
      // float: left;
      height: 10px;
      width: calc(100% - 1000px);
    }
    .assist-container {
      height: 100%;
      display: flex;
      justify-content: space-between;
    }
    .point {
      float: left;
      width: 20px;
      height: 20px;
      background: rgb(153, 170, 207);
      border-radius: 50%;
    }
    .point.active {
      background: rgb(83, 132, 236);
    }
  }
  .progress {
    position: absolute;
    bottom: 95px;
    left: 513px;
    width: 450px;
    display: flex;
    color: #fff;
    .progress-text {
      display: inline-block;
    }
    .progress-bar {
      width: 300px;
      color: #fff;
      .el-progress__text {
        color: #fff;
      }
    }
  }
}
</style>
