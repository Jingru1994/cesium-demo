import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

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
      cylinder.scale.set(1, 0, 1);

      mesh.add(cylinder);
      const tween = new TWEEN.Tween({ scale: 0 });
      tween
        .to({ scale: 1 }, 1000)
        .easing(TWEEN.Easing.Quartic.Out)
        .onStart(() => {
          cylinder.visible = true;
        })
        .onUpdate(({ scale }) => {
          cylinder.scale.set(1, scale, 1);
          cylinder.position.set(
            item.position[0],
            (height / 2) * scale,
            item.position[1]
          );
        })
        .delay(3300)
        .start();
    }
    console.log(mesh);
    this.mesh = mesh;
    // this.animate();
  }
  get mesh() {
    return this.mesh;
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
