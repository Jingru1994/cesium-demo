import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shader.js";
import LinearSpline from "./LinerSpline.js";

class ParticleSystem {
  constructor(params) {
    this.PARTICLE_LIFE = 5.0;
    this._camera = params.camera;
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load("images/fire3.png")
      },
      depthTexture: {
        value: null
      },
      pointMultiplier: {
        value:
          window.innerHeight / (2.0 * Math.tan((0.5 * 60.0 * Math.PI) / 180.0))
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      nf: {
        value: this._camera.near * this._camera.far
      },
      f_sub_n: {
        value: this._camera.far - this._camera.near
      },
      f: {
        value: this._camera.far
      },
      cameraNear: {
        value: this._camera.near
      },
      cameraFar: {
        value: this._camera.far
      }
    };

    this._material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      // blendDst: THREE.OneFactor,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

    this._particles = [];

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this._geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute([], 1)
    );
    this._geometry.setAttribute(
      "colour",
      new THREE.Float32BufferAttribute([], 4)
    );
    this._geometry.setAttribute(
      "angle",
      new THREE.Float32BufferAttribute([], 1)
    );
    this._geometry.setAttribute(
      "blend",
      new THREE.Float32BufferAttribute([], 1)
    );

    this._points = new THREE.Points(this._geometry, this._material);

    params.parent.add(this._points);

    this._alphaSplineF = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSplineF.AddPoint(0.0, 0.0);
    this._alphaSplineF.AddPoint(0.1, 1.0);
    this._alphaSplineF.AddPoint(0.5, 1.0);
    this._alphaSplineF.AddPoint(1.0, 0.0);

    this._colourSplineF = new LinearSpline((t, a, b) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this._colourSplineF.AddPoint(0.0, new THREE.Color(0xffff80));
    this._colourSplineF.AddPoint(1.0, new THREE.Color(0xff8080));

    this._sizeSplineF = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSplineF.AddPoint(0.0, 0.5);
    this._sizeSplineF.AddPoint(0.25, 7.0);
    this._sizeSplineF.AddPoint(0.5, 2.5);
    this._sizeSplineF.AddPoint(1.0, 0.0);

    this._alphaSplineS = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSplineS.AddPoint(0.0, 0.0);
    this._alphaSplineS.AddPoint(0.1, 1.0);
    this._alphaSplineS.AddPoint(0.5, 1.0);
    this._alphaSplineS.AddPoint(1.0, 0.0);

    this._colourSplineS = new LinearSpline((t, a, b) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this._colourSplineS.AddPoint(0.0, new THREE.Color(0x262626));
    this._colourSplineS.AddPoint(1.0, new THREE.Color(0x000000));

    this._sizeSplineS = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSplineS.AddPoint(0.0, 1.0);
    this._sizeSplineS.AddPoint(0.5, 8.0);
    this._sizeSplineS.AddPoint(1.0, 16.0);

    this._alphaSplineX = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSplineX.AddPoint(0.0, 0.0);
    this._alphaSplineX.AddPoint(0.1, 1.0);
    this._alphaSplineX.AddPoint(0.9, 1.0);
    this._alphaSplineX.AddPoint(1.0, 0.0);

    this._colourSplineX = new LinearSpline((t, a, b) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this._colourSplineX.AddPoint(0.0, new THREE.Color(0xff8080));
    this._colourSplineX.AddPoint(1.0, new THREE.Color(0xffffff));

    this._sizeSplineX = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSplineX.AddPoint(0.0, 1.0);
    this._sizeSplineX.AddPoint(1.0, 1.0);

    this._rateLimiter = 0.0;

    this._UpadteGeometry();
  }

  _CreateParticleF() {
    const life = (Math.random() * 0.75 + 0.25) * 10.0;
    return {
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * 4.0,
        (Math.random() * 2 - 1) * 4.0,
        (Math.random() * 2 - 1) * 4.0
      ),
      size: (Math.random() * 0.5 + 0.5) * 2.0,
      colour: new THREE.Color(),
      alpha: 1.0,
      life: life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new THREE.Vector3(0, 5, 0),
      blend: 0.0
    };
  }

  _CreateParticleS() {
    const life = (Math.random() * 0.75 + 0.25) * 13.0;
    return {
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * 4.0,
        (Math.random() * 2 - 1) * 4.0 + 12,
        (Math.random() * 2 - 1) * 4.0
      ),
      size: (Math.random() * 0.5 + 0.5) * 2.0,
      colour: new THREE.Color(),
      alpha: 1.0,
      life: life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new THREE.Vector3(0, 5, 0),
      blend: 1.0
    };
  }

  _CreateParticleX() {
    const life = (Math.random() * 0.75 + 0.25) * 2.0;
    const dirX = (Math.random() * 2.0 - 1.0) * 3.0;
    const dirY = (Math.random() * 2.0 - 1.0) * 3.0;
    return {
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * 4.0,
        10 + (Math.random() * 2 - 1) * 4.0,
        (Math.random() * 2 - 1) * 4.0
      ),
      size: (Math.random() * 0.5 + 0.5) * 0.5,
      colour: new THREE.Color(),
      alpha: 1.0,
      life: life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new THREE.Vector3(dirX, 10, dirY),
      blend: 0.0
    };
  }

  _AddParticles(timeElapsed) {
    this._rateLimiter += timeElapsed;
    const n = Math.floor(this._rateLimiter * 120.0);
    this._rateLimiter -= n / 120.0;

    for (let i = 0; i < n; i++) {
      const p = this._CreateParticleF();
      this._particles.push(p);
    }
    for (let i = 0; i < n; i++) {
      const p = this._CreateParticleS();
      this._particles.push(p);
    }
    for (let i = 0; i < n * 2; i++) {
      const p = this._CreateParticleX();
      this._particles.push(p);
    }
  }
  _UpadteGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];
    const blends = [];

    // const box = new THREE.Box3()
    for (let p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      sizes.push(p.currentSize);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      angles.push(p.rotation);
      blends.push(p.blend);

      // box.expandByPoint(p.position)
    }
    this._geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this._geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    this._geometry.setAttribute(
      "colour",
      new THREE.Float32BufferAttribute(colours, 4)
    );
    this._geometry.setAttribute(
      "angle",
      new THREE.Float32BufferAttribute(angles, 1)
    );
    this._geometry.setAttribute(
      "blend",
      new THREE.Float32BufferAttribute(blends, 1)
    );
    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.size.needsUpdate = true;
    this._geometry.attributes.colour.needsUpdate = true;
    this._geometry.attributes.angle.needsUpdate = true;
    this._geometry.attributes.blend.needsUpdate = true;

    // this._geometry.boundingBox = box
    // this._geometry.boundingSphere = new THREE.Sphere()
    // box.getBoundingSphere(this._geometry.boundingSphere)
  }
  _UpdateParticles(timeElapsed) {
    for (let p of this._particles) {
      p.life -= timeElapsed;
    }
    this._particles = this._particles.filter(p => {
      return p.life > 0.0;
    });

    for (let p of this._particles) {
      const t = 1.0 - p.life / p.maxLife;

      p.rotation += timeElapsed * 0.5;

      if (p.blend == 0.0) {
        if (p.velocity.x != 0.0) {
          p.alpha = this._alphaSplineX.Get(t);
          // p.alpha =1;
          p.currentSize = p.size * this._sizeSplineX.Get(t);
          p.colour.copy(this._colourSplineX.Get(t));
          // console.log(this._alphaSplineX.Get(t))
          // console.log(this._colourSplineX.Get(t))
        } else {
          p.alpha = this._alphaSplineF.Get(t);
          // p.alpha =1;
          p.currentSize = p.size * this._sizeSplineF.Get(t);
          p.colour.copy(this._colourSplineF.Get(t));
        }
      } else {
        p.alpha = this._alphaSplineS.Get(t);
        // p.alpha =1;
        p.currentSize = p.size * this._sizeSplineS.Get(t);
        p.colour.copy(this._colourSplineS.Get(t));
      }

      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

      const drag = p.velocity.clone();
      drag.multiplyScalar(timeElapsed * 0.1);
      drag.x =
        Math.sign(p.velocity.x) *
        Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
      drag.y =
        Math.sign(p.velocity.y) *
        Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
      drag.z =
        Math.sign(p.velocity.z) *
        Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
      p.velocity.sub(drag);
    }
    this._particles.sort((a, b) => {
      const d1 = this._camera.position.distanceTo(a.position);
      const d2 = this._camera.position.distanceTo(b.position);

      if (d1 > d2) {
        return -1;
      }
      if (d1 < d2) {
        return 1;
      }
      return 0;
    });
  }
  Step(timeElapsed) {
    this._AddParticles(timeElapsed);
    this._UpdateParticles(timeElapsed);
    this._UpadteGeometry();
  }
}

export default ParticleSystem;
