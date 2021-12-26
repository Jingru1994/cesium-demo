import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {
  CSS3DRenderer,
  CSS3DObject
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

class GlowCylinder {
  mesh;
  constructor(data, maxHeight, container, scene, camera) {
    this.scene = scene;
    this.camera = camera;
    const maxSale = Math.max(
      ...data.map(item => {
        return item.sales;
      })
    );
    const heightScale = maxSale / maxHeight;

    let mesh = new THREE.Group();
    // const labelRenderer = new CSS3DRenderer();
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    // labelRenderer.domElement.style.position = "absolute";
    // labelRenderer.domElement.style.top = 0;
    // container.appendChild(labelRenderer.domElement);
    // this.labelRenderer = labelRenderer;

    const materials1 = this.createMaterial("#5AFEF9", "#2BFDAA");
    const materials2 = this.createMaterial("#FFD75E", "#FF1A00");
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
      cylinder.visible = false;
      // cylinder.renderOrder = 0;
      cylinder.scale.set(1, 0, 1);

      // const element = document.createElement("div");
      // element.className = "cylinder-label";
      // const topDiv = document.createElement("div");
      // topDiv.innerText = "TOP" + item.number + " " + item.name;
      // element.appendChild(topDiv);
      // const sales = document.createElement("div");
      // sales.innerText = item.sales + "万";
      // element.appendChild(sales);

      // const label = new CSS3DObject(element);
      // label.position.set(item.position[0], height, item.position[1]);
      // label.rotation.y = 0.25;
      // label.visible = false;
      // scene.add(label);

      const labelSprite = this.createLabelSprite(item);
      labelSprite.position.set(item.position[0], height / 2, item.position[1]);
      labelSprite.material.opacity = 0.0;
      // labelSprite.renderOrder = 1;
      scene.add(labelSprite);

      mesh.add(cylinder);
      const cylinderTween = new TWEEN.Tween({ scale: 0 });
      cylinderTween
        .to({ scale: 1 }, 1000)
        .easing(TWEEN.Easing.Quartic.Out)
        .onStart(() => {
          cylinder.visible = true;
          // label.visible = true;
        })
        .onUpdate(({ scale }) => {
          this.texture.needsUpdate = true;
          cylinder.scale.set(1, scale, 1);
          cylinder.position.set(
            item.position[0],
            (height / 2) * scale,
            item.position[1]
          );
        })
        .delay(3300)
        .start();
      const labelOpacityTween = new TWEEN.Tween({ opacity: 0 });
      labelOpacityTween
        .to({ opacity: 1 }, 500)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(({ opacity }) => {
          labelSprite.material.opacity = opacity;
        })
        .onStart(() => {
          const labelPositionTween = new TWEEN.Tween(labelSprite.position);
          labelPositionTween
            .to(
              {
                x: item.position[0],
                y: height + 5,
                z: item.position[1]
              },
              500
            )
            .start();
        })
        .delay(3500)
        .start();
    }
    console.log(mesh);
    this.mesh = mesh;
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createLabelSprite(object) {
    const topText = "TOP" + object.number + " " + object.name;
    const bottomText = object.sales + "万";
    const canvas = document.createElement("canvas");
    const fontSize1 = 200;
    const fontSize2 = 250;
    canvas.height = 200 + 250 + 200;

    const characterC = topText.match(/[\u4e00-\u9fa5]/g);
    const cLength = characterC ? characterC.length : 0;
    const characterEc = topText.match(/[A-Z]/g);
    const eCLength = characterEc ? characterEc.length : 0;
    const characterN = topText.match(/\d/g);
    const nLength = characterN ? characterN.length : 0;

    canvas.width = fontSize1 * (cLength + eCLength / 1.15 + +nLength / 1.7);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0.5,0.5,0.5,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "normal normal bold" + fontSize1 + "px Source Han Sans CN";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(topText, 10, 10 + 200);
    ctx.font = "normal normal bold" + fontSize2 + "px Source Han Sans CN";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(bottomText, 10, 10 + 200 + 250 + 100);

    const texture = new THREE.CanvasTexture(canvas);
    this.texture = texture;
    this.texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const labelSprite = new THREE.Sprite(material);
    labelSprite.scale.set(canvas.width / 10, canvas.height / 10);
    labelSprite.center.set(0.5, 0);
    return labelSprite;
  }
  createMaterial(color1, color2) {
    let uniforms = {
      color1: {
        type: "v3",
        value: new THREE.Color(color1)
      },
      color2: {
        type: "v3",
        value: new THREE.Color(color2)
      }
    };
    let vertex = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main()
      {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    let fragment = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      
      void main() {
        // float a = vUv.y > 0.4 ? 1.0 : pow(vUv.y*2.0,1.5);
        float a = vUv.y > 0.45 ? 1.0 : vUv.y/0.45;
        // float a = vUv.y;
        vec3 color = mix(color2,color1,vUv.y);
        
        gl_FragColor = vec4(color, a);
      }
    `;
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      // side: THREE.DoubleSide,
      // depthWrite: false,
      // depthTest: false,
      transparent: true
    });
    // const material = new THREE.MeshLambertMaterial({
    //   color: color1
    // });
    const topMaterial = new THREE.MeshLambertMaterial({
      color: color1
    });
    const bottomMaterial = new THREE.MeshLambertMaterial({
      color: color1,
      opacity: 0
    });
    return [material, topMaterial, bottomMaterial];
    // return material;
  }
  animate() {
    // this.labelRenderer.render(this.scene, this.camera);
    this.texture.needsUpdate = true;
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
