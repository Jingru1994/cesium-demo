<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import {
  BokehShader,
  BokehDepthShader
} from "three/examples/jsm/shaders/BokehShader2.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

import * as d3 from "d3";
import * as dat from "dat.gui";
import * as TWEEN from "@tweenjs/tween.js";
import InnerGlowMaterial from "@/utils/widgets/InnerGlow/InnerGlowMaterial.js";
import ColumnCircleMark from "@/utils/widgets/ColumnCircleMark/ColumnCircleMark.js";
import BottomCircle from "@/utils/widgets/BottomCircle/BottomCircle.js";

// const d3 = Object.assign({}, require("d3-selection"), require("d3-geo"), require("d3-path"));

export default {
  name: "ThreeDof2",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.interval = 0;
    this.depth = 1.5; //拉伸地图的厚度
    this.clock = new THREE.Clock();

    this.initScene();

    this.addState();
    this.initControls();
    await this.drawMap();
    this.createColumnCircleMark();
    this.initLight();
    this.createBottomElements();

    this.addClickListener();

    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }

    this.initPostProcessing();
    this.addPostProcessing();
    this.cameraAnimate();
    this.animate();
  },
  beforeDestroy() {
    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.mark.stop();
    this.bottomCircle.stop();
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
    addPostProcessing() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      const composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      composer.addPass(renderPass);

      //抗锯齿
      const pass = new SMAAPass(
        width * this.renderer.getPixelRatio(),
        height * this.renderer.getPixelRatio()
      );
      pass.renderToScreen = true;
      composer.addPass(pass);

      this.composer = composer;
    },
    initPostProcessing() {
      const postprocessing = { enabled: true };
      let materialDepth;
      const shaderSettings = {
        rings: 3,
        samples: 4
      };
      const depthShader = BokehDepthShader;
      materialDepth = new THREE.ShaderMaterial({
        uniforms: depthShader.uniforms,
        vertexShader: depthShader.vertexShader,
        fragmentShader: depthShader.fragmentShader
      });

      materialDepth.uniforms["mNear"].value = this.camera.near;
      materialDepth.uniforms["mFar"].value = this.camera.far;
      this.materialDepth = materialDepth;

      postprocessing.scene = new THREE.Scene();

      postprocessing.camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        -10000,
        10000
      );
      postprocessing.camera.position.z = 100;

      postprocessing.scene.add(postprocessing.camera);

      const pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
      };
      postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        pars
      );
      postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        pars
      );

      const bokeh_shader = BokehShader;

      postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(
        bokeh_shader.uniforms
      );

      postprocessing.bokeh_uniforms["tColor"].value =
        postprocessing.rtTextureColor.texture;
      postprocessing.bokeh_uniforms["tDepth"].value =
        postprocessing.rtTextureDepth.texture;
      postprocessing.bokeh_uniforms["textureWidth"].value = window.innerWidth;
      postprocessing.bokeh_uniforms["textureHeight"].value = window.innerHeight;

      postprocessing.materialBokeh = new THREE.ShaderMaterial({
        uniforms: postprocessing.bokeh_uniforms,
        vertexShader: bokeh_shader.vertexShader,
        fragmentShader: bokeh_shader.fragmentShader,
        defines: {
          RINGS: shaderSettings.rings,
          SAMPLES: shaderSettings.samples
        }
      });

      postprocessing.quad = new THREE.Mesh(
        new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
        postprocessing.materialBokeh
      );
      postprocessing.quad.position.z = -500;
      postprocessing.scene.add(postprocessing.quad);
      this.postprocessing = postprocessing;

      let effectController = {
        enabled: true,
        jsDepthCalculation: true,
        shaderFocus: false,

        fstop: 2.2,
        maxblur: 1.0,

        showFocus: false,
        focalDepth: 12.0,
        manualdof: false,
        vignetting: true,
        depthblur: false,

        threshold: 0.5,
        gain: 2.0,
        bias: 0.5,
        fringe: 0.0,

        focalLength: 35,
        noise: true,
        pentagon: false,

        dithering: 0.0001
      };
      const that = this;

      const shaderUpdate = function() {
        postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
        postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;
        postprocessing.materialBokeh.needsUpdate = true;
      };

      const matChanger = function() {
        for (const e in effectController) {
          if (e in postprocessing.bokeh_uniforms) {
            postprocessing.bokeh_uniforms[e].value = effectController[e];
          }
        }

        postprocessing.enabled = effectController.enabled;
        postprocessing.bokeh_uniforms["znear"].value = that.camera.near;
        postprocessing.bokeh_uniforms["zfar"].value = that.camera.far;
        // that.camera.setFocalLength( effectController.focalLength );
      };

      const gui = new dat.GUI();

      gui.add(effectController, "enabled").onChange(matChanger);
      gui.add(effectController, "jsDepthCalculation").onChange(matChanger);
      gui.add(effectController, "shaderFocus").onChange(matChanger);
      gui
        .add(effectController, "focalDepth", -10.0, 50.0, 0.01)
        .listen()
        .onChange(matChanger);

      gui.add(effectController, "fstop", 0.1, 22, 0.001).onChange(matChanger);
      gui
        .add(effectController, "maxblur", 0.0, 5.0, 0.025)
        .onChange(matChanger);

      gui.add(effectController, "showFocus").onChange(matChanger);
      gui.add(effectController, "manualdof").onChange(matChanger);
      gui.add(effectController, "vignetting").onChange(matChanger);

      gui.add(effectController, "depthblur").onChange(matChanger);

      gui.add(effectController, "threshold", 0, 1, 0.001).onChange(matChanger);
      gui.add(effectController, "gain", 0, 100, 0.001).onChange(matChanger);
      gui.add(effectController, "bias", 0, 3, 0.001).onChange(matChanger);
      gui.add(effectController, "fringe", 0, 5, 0.001).onChange(matChanger);

      gui
        .add(effectController, "focalLength", 16, 80, 0.001)
        .onChange(matChanger);

      gui.add(effectController, "noise").onChange(matChanger);

      gui
        .add(effectController, "dithering", 0, 0.001, 0.0001)
        .onChange(matChanger);

      gui.add(effectController, "pentagon").onChange(matChanger);

      gui
        .add(shaderSettings, "rings", 1, 8)
        .step(1)
        .onChange(shaderUpdate);
      gui
        .add(shaderSettings, "samples", 1, 13)
        .step(1)
        .onChange(shaderUpdate);

      matChanger();
    },
    addClickListener() {
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.background = new THREE.Color("rgba(27,70,74,1)");
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
      // camera.position.set(0, 0, 50)//camera默认放在中心点(0,0,0)，挪一下位置
      camera.position.set(
        -38.25374545966521,
        -762.3175314965309,
        600.429209948726
      );
      camera.up.set(
        0.0604152972374721,
        0.9128441505074004,
        -0.4137215836084547
      );
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
        // controls = new OrbitControls(this.camera, renderer.domElement)
        controls = new TrackballControls(this.camera, renderer.domElement);
      } else {
        // controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls = new TrackballControls(this.camera, this.renderer.domElement);
      }
      //OrbitControls参数设置
      // controls.enableDamping = true
      //TrackballControls参数设置
      controls.rotateSpeed = 2.0;
      controls.zoomSpeed = 2.0;
      controls.panSpeed = 1.0;
      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      // this.initPointLight()
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff");
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.2);
      //光源位置
      dirLight.position.set(-16, -12, 0);
      //可以产生阴影
      // dirLight.castShadow = true
      // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)

      dirLight.target = this.target;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光范围
      // const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    initPointLight() {
      const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
      pointLight.position.set(50, 50, 0);
      this.scene.add(pointLight);
      // 显示阴影
      // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      // this.renderer.render(this.scene,this.camera)
      // this.composer.render(this.clock.getDelta())//后处理

      // this.controls.update()//OrbitControls
      this.controls.update(this.clock.getDelta()); //TrackballControls

      // this.texture.needsUpdate = true

      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);

      if (this.postprocessing.enabled) {
        this.renderer.clear();

        // render scene into texture

        this.renderer.setRenderTarget(this.postprocessing.rtTextureColor);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        // render depth into texture

        this.scene.overrideMaterial = this.materialDepth;
        this.renderer.setRenderTarget(this.postprocessing.rtTextureDepth);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.scene.overrideMaterial = null;

        // render bokeh composite

        this.renderer.setRenderTarget(null);
        this.renderer.render(
          this.postprocessing.scene,
          this.postprocessing.camera
        );
        // this.composer.render( this.postprocessing.scene, this.postprocessing.camera )//后处理
      } else {
        this.scene.overrideMaterial = null;

        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
      }
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
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async drawMap() {
      await this.drawExtrudeMap();
      // this.drawRSImageMap()
      await this.drawGlowMap();
    },
    async drawExtrudeMap() {
      const group = new THREE.Group();
      const lineGroup = new THREE.Group();
      let features = await this.getData("data/tongliao.geojson");

      let rsTexture = new THREE.TextureLoader().load(
        "/images/rs/tongliaioL10.png"
      );
      rsTexture.wrapS = THREE.RepeatWrapping;
      rsTexture.wrapT = THREE.RepeatWrapping;
      rsTexture.flipY = true;
      rsTexture.generateMipmaps = true;
      rsTexture.anisotropy = 4; //使纹理斜着的时候不变模糊，沿纹理单元密度最高方向的轴线所取样本数，默认为1，通常为2的幂，越大越清晰，但需要更多的采样，为4时就比较清楚了
      // rsTexture.anisotropy= this.renderer.getMaxAnisotropy()//getMaxAnisotropy()找到GPU有效最大的anisotropy值，这个设备为16

      let rsMaterial = new THREE.MeshBasicMaterial({
        map: rsTexture,
        transparent: true
        // side: THREE.DoubleSide,
      });
      this.center = this.computeFeaturesCenter(features);
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinate => {
          coordinate.forEach(points => {
            let points_prj = [];
            points.forEach(point => {
              points_prj.push(this.projection(point, this.center));
            });
            let item = this.drawExtrude(this.drawShape(points_prj));
            item.label = feature.properties.name;

            this.reMapUv(item.geometry);

            item.material[0] = rsMaterial;
            let lines = this.drawLine(points_prj);
            lines.forEach(line => {
              // this.adjustModel(line)
              lineGroup.add(line);
            });
            group.add(item);
          });
        });
      });
      this.target = group;
      this.scene.add(group);
      this.scene.add(lineGroup);
    },
    async drawGlowMap() {
      const group = new THREE.Group();
      let features = await this.getData("data/kerqin.geojson");
      let materialOptions = {
        glowColor: new THREE.Color("#F3FC93")
      };
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinate => {
          let inputFeature = JSON.stringify(feature);
          inputFeature = JSON.parse(inputFeature);
          inputFeature.geometry.coordinates = [coordinate];
          let material = new InnerGlowMaterial(inputFeature, materialOptions)
            .material;

          let points_prj = [];
          coordinate.forEach(points => {
            // points一定只有一个，这一层应该就是geojson的格式
            points.forEach(point => {
              points_prj.push(this.projection(point, this.center));
            });
          });
          let shape = this.drawShape(points_prj);
          let geometry = new THREE.ShapeGeometry(shape);

          let item = new THREE.Mesh(geometry, material);
          item.label = feature.properties.name;

          item.position.z = this.depth + 0.01;

          this.reMapUv(item.geometry);
          item.renderOrder = 10;

          //获取包围盒位置，获取几何中心坐标
          let bBox2 = new THREE.Box3();
          bBox2.setFromObject(item);
          let x = bBox2.min.x + (bBox2.max.x - bBox2.min.x) / 2;
          let y = bBox2.min.y + (bBox2.max.y - bBox2.min.y) / 2;

          // 调整模型中心
          item.traverse(function(o) {
            if (o.isMesh) {
              // o.geometry.computeBoundingBox()
              o.geometry.center();
            }
          });

          //调整模型位置
          item.position.set(x, y, this.depth + 0.01);

          group.add(item);
        });
      });

      this.scene.add(group);
    },
    drawShape(posArr) {
      var shape = new THREE.Shape();
      shape.moveTo(posArr[0][0], posArr[0][1]);
      posArr.forEach(item => {
        shape.lineTo(item[0], item[1]);
      });
      return shape;
    },
    drawExtrude(shapeObj) {
      const extrudeSettings = {
        steps: 2,
        depth: this.depth,
        bevelEnabled: false
      };
      let geometry = new THREE.ExtrudeGeometry(shapeObj, extrudeSettings);

      let material1 = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgba(33,76,65,1)"),
        specular: new THREE.Color("rgba(50,88,68,1)"),
        shininess: 32.0
      });
      let material2 = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgba(33,76,60,1)"),
        specular: new THREE.Color("rgba(39,60,50,1)"),
        shininess: 32.0
      });
      let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
      // shapeGeometryObj.position = geometry.boundingSphere.center
      // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
      shapeGeometryObj.name = "board";
      return shapeGeometryObj;
    },
    drawLine(posArr) {
      let geometry1 = new THREE.BufferGeometry();
      let geometry2 = new THREE.BufferGeometry();
      let verticesList1 = [];
      let verticesList2 = [];
      posArr.forEach(item => {
        verticesList1.push(item[0]);
        verticesList1.push(item[1]);
        verticesList1.push(this.depth);
        verticesList2.push(item[0]);
        verticesList2.push(item[1]);
        verticesList2.push(-0.001);
      });
      const vertices1 = new Float32Array(verticesList1);
      const vertices2 = new Float32Array(verticesList2);
      geometry1.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices1, 3)
      );
      geometry2.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices2, 3)
      );
      let lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("rgb(70,117,92)")
      });
      let line1 = new THREE.Line(geometry1, lineMaterial);
      let line2 = new THREE.Line(geometry2, lineMaterial);
      line1.name = "line";
      line2.name = "line";
      return [line1, line2];
    },
    reMapUv(geometry) {
      geometry.computeBoundingBox();
      const max = geometry.boundingBox.max;
      const min = geometry.boundingBox.min;
      const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
      const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
      const uvArray = geometry.getAttribute("uv");
      for (let i = 0; i < uvArray.array.length; i++) {
        uvArray.array[i] =
          i % 2
            ? (uvArray.array[i] + offset.y) / range.y
            : (uvArray.array[i] + offset.x) / range.x;
      }
      geometry.setAttribute("uv", uvArray);
    },
    projection(point, center) {
      const projection = d3
        .geoMercator()
        .center(center)
        .translate([0, 0])
        .reflectY(90)
        .scale(1000);
      // const projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]).reflectY(90)
      // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
      return projection(point);
    },
    computeFeaturesCenter(features) {
      let coordinateList = [];
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinate => {
          coordinate.forEach(points => {
            coordinateList.push(...points);
          });
        });
      });
      let xMax = Math.max(
        ...coordinateList.map(item => {
          return item[0];
        })
      );
      let xMin = Math.min(
        ...coordinateList.map(item => {
          return item[0];
        })
      );
      let yMax = Math.max(
        ...coordinateList.map(item => {
          return item[1];
        })
      );
      let yMin = Math.min(
        ...coordinateList.map(item => {
          return item[1];
        })
      );
      //计算最值的另一种方法
      // let xMax1 = coordinateList.sort((a,b) => { return b[0]-a[0]})[0][0]
      // let xMin1 = coordinateList.sort((a,b) => { return a[0]-b[0]})[0][0]
      let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
      return center;
    },
    createColumnCircleMark() {
      let options = {
        size: 12,
        text: "公司村",
        // position: new THREE.Vector3(2.3, -1.0, this.depth + 0.05)
        position: new THREE.Vector3(13, -7, this.depth + 0.1)
      };
      let mark = new ColumnCircleMark(options);
      mark.renderOrder = 50;
      this.mark = mark;
      this.scene.add(mark.mesh);
    },
    createBottomElements() {
      let options = {
        radius: 44,
        position: new THREE.Vector3(0, 0, -0.01)
      };
      let bottomCircle = new BottomCircle(options);
      this.bottomCircle = bottomCircle;
      this.scene.add(bottomCircle.mesh);
    },
    cameraAnimate() {
      // this.cameraPosition =
      const that = this;
      const tween1 = new TWEEN.Tween(this.camera.position);
      tween1
        .to(
          {
            x: -5.107771978991797,
            y: -101.78726500331169,
            z: 80.17137817728137
          },
          2000
        )
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        .onComplete(function() {
          const tween2 = new TWEEN.Tween(that.camera.position);
          tween2
            .to(
              {
                x: -39.286488503979823,
                y: -81.27763802537058,
                z: 33.539098370323748
              },
              2000
            )
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .delay(500)
            .start(); ///5500

          const tween3 = new TWEEN.Tween(that.camera.up);
          tween3
            .to(
              {
                x: 0.4362048516687863,
                y: 0.897157348161131,
                z: -0.11372783309517592
              },
              2000
            )
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .delay(500)
            .start()
            .onComplete(function() {
              const tween4 = new TWEEN.Tween(that.camera.position);
              tween4
                .to(
                  {
                    x: -12.177223995222219,
                    y: -99.31689762849348,
                    z: 37.9168629387508
                  },
                  2000
                )
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .delay(500)
                .start(); //8500
              const tween5 = new TWEEN.Tween(that.camera.up);
              tween5
                .to(
                  {
                    x: 0.12505401667885055,
                    y: 0.9889423359324844,
                    z: -0.12022707312745105
                  },
                  2000
                )
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .delay(500)
                .start();
            });
        });
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
