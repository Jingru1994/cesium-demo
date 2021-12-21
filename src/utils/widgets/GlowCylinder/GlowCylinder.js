import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// var TWEEN = require('@tweenjs/tween.js')
const d3 = Object.assign(
  {},
  require("d3-scale"),
  require("d3-geo"),
  require("d3-array")
);

class GlowCylinder {
  mesh;
  constructor(data, maxHeight) {
    const maxSale = Math.max(
      ...data.map(item => {
        return item.sales;
      })
    );
    const heightScale = maxSale / maxHeight;

    let mesh = new THREE.Group();
    const materials1 = this.createMaterial("#5BFFFD");
    const materials2 = this.createMaterial("#FFAD5C");
    for (let item of data) {
      let cylinderRadius = undefined;
      let materials = undefined;
      if (item.number < 4) {
        cylinderRadius = 16;
        materials = materials2;
      } else {
        cylinderRadius = 9;
        materials = materials1;
      }
      const height = item.sales / heightScale;

      const geometry = new THREE.CylinderGeometry(
        cylinderRadius,
        cylinderRadius,
        height,
        32
      );
      const cylinder = new THREE.Mesh(geometry, materials);
      // cylinder.rotation.x = Math.PI / 2;
      cylinder.position.set(item.position[0], height / 2, item.position[1]);
      // cylinder.position.set(0, 300, 0);
      mesh.add(cylinder);
    }
    console.log(mesh);
    this.mesh = mesh;
    // this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(color) {
    let uniforms = {
      glowColor: {
        type: "v3",
        value: new THREE.Color(color)
      }
    };
    let vertex = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main()
      {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    let fragment = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      varying vec2 vUv;
      
      

      void main() {
        float a = vUv.y > 0.5 ? 1.0 : pow(vUv.y*2.0,1.5);
        
        gl_FragColor = vec4(glowColor, a);
      }
    `;
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide,
      // depthWrite: false,
      transparent: true
    });
    const topMaterial = new THREE.MeshLambertMaterial({
      color: color
    });
    const bottomMaterial = new THREE.MeshLambertMaterial({
      color: color,
      opacity: 0
    });
    return [material, topMaterial, bottomMaterial];
    // return material;
  }
  createTexture(data) {
    const canvas = document.createElement("canvas");
    canvas.height = 500;
    canvas.width = 1;
    const y = d3
      .scalePow()
      .rangeRound([0, 500]) //与 canvas的height保持一致
      .domain([0, d3.sum(data.map(({ value }) => value))]);
    const ctx = canvas.getContext("2d");
    let left = 0;
    data.forEach(item => {
      const current = y(item.value);
      ctx.moveTo(0.5, 500 - left); //与 canvas的height保持一致
      ctx.lineTo(0.5, 500 - (left + current));
      left += current;
      ctx.lineWidth = 1;
      ctx.strokeStyle = item.color;
      ctx.stroke();
      ctx.beginPath();
    });

    return canvas;
  }
  createPopup() {
    const raycaster = new THREE.Raycaster();
    this._raycaster = raycaster;
    let selectedObject;
    this._selectedObject = selectedObject;
    // const container = document.querySelector('.three-view')
    let popup = new PopupLegend(
      this._scene,
      this._camera,
      this._container,
      this._legendPanelColor
    );
    this._popup = popup;
    let labelRenderer = popup.getCSS2DRenderer();
    this._labelRenderer = labelRenderer;
    const controls = new OrbitControls(this._camera, labelRenderer.domElement);
    this._controls = controls;
    controls.enableDamping = true;

    this.isPopup = true;
  }
  onPointerMove(event, that) {
    let mouse = new THREE.Vector2();
    if (event.isPrimary === false) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    that._raycaster.setFromCamera(mouse, that._camera);
    const intersects = that._raycaster.intersectObject(that.mesh, true);
    if (intersects.length > 0) {
      if (
        !that._selectedObject ||
        that._selectedObject !== intersects[0].object
      ) {
        that._selectedObject = intersects[0].object;
        that._popup
          .addTo(that._selectedObject)
          .setHtml(that._selectedObject.html)
          .setOffset(that._legendOffset);
      }
    } else {
      if (that._selectedObject) {
        that._popup.removeFrom(that._selectedObject);
      }
      that._selectedObject = null;
    }
  }
  openPopup() {
    const that = this;
    this._isPopup = true;

    this._labelRenderer.domElement.addEventListener(
      "mousemove",
      function _listener(e) {
        that.onPointerMove(e, that);
        if (!that._isPopup) {
          this.removeEventListener("mousemove", _listener);
        }
      }
    );
  }
  closePopup() {
    this._isPopup = false;
  }
  animate() {
    if (this._isPopup) {
      this._controls.update();
    }
    this.start = requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
  stop() {
    cancelAnimationFrame(this.start);
  }
}

export default GlowCylinder;
