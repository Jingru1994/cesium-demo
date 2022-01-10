import {
  ACESFilmicToneMapping,
  BloomCompositeMaterial,
  Color,
  DirectionalLight,
  Events,
  FXAAMaterial,
  Fog,
  GLSL3,
  Group,
  HemisphereLight,
  LuminosityMaterial,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  NoBlending,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  RGBFormat,
  RawShaderMaterial,
  Reflector,
  ReflectorMaterial,
  RepeatWrapping,
  SVGLoader,
  Scene,
  Stage,
  TextureLoader,
  Uniform,
  UnrealBloomBlurMaterial,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
  getFullscreenTriangle,
  mix,
  ticker
} from "../build/alien.js";

class Config {
  static BG_COLOR = "#0e0e0e";
  static UI_COLOR = "rgba(255, 255, 255, 0.94)";
}

import rgbshift from "../src/shaders/modules/rgbshift/rgbshift.glsl.js";

const vertexCompositeShader = /* glsl */ `
            in vec3 position;
            in vec2 uv;

            out vec2 vUv;

            void main() {
                vUv = uv;

                gl_Position = vec4(position, 1.0);
            }
        `;

const fragmentCompositeShader = /* glsl */ `
            precision highp float;

            uniform sampler2D tScene;
            uniform sampler2D tBloom;
            uniform float uDistortion;

            in vec2 vUv;

            out vec4 FragColor;

            ${rgbshift}

            void main() {
                FragColor = texture(tScene, vUv);

                float angle = length(vUv - 0.5);
                float amount = 0.0002 + uDistortion;

                FragColor.rgb += getRGB(tBloom, vUv, angle, amount).rgb;
            }
        `;

class CompositeMaterial extends RawShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        tScene: new Uniform(null),
        tBloom: new Uniform(null),
        uDistortion: new Uniform(0.00125)
      },
      vertexShader: vertexCompositeShader,
      fragmentShader: fragmentCompositeShader,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false
    });
  }
}

// https://vimeo.com/69949278

class Triangle extends Group {
  constructor() {
    super();
  }

  async initMesh() {
    const { camera, loadSVG } = WorldController;

    const data = await loadSVG(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><path stroke-width="0.3" d="M 3 0 L 0 5 H 6 Z"/></svg>'
    );
    const paths = data.paths;

    const group = new Group();
    group.position.set(0, 1.4, -11);
    group.scale.y *= -1;
    group.lookAt(camera.position);

    for (let i = 0, l = paths.length; i < l; i++) {
      const path = paths[i];

      const material = new MeshStandardMaterial({ emissive: 0xffffff });

      for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
        const subPath = path.subPaths[j];
        const geometry = SVGLoader.pointsToStroke(
          subPath.getPoints(),
          path.userData.style
        );

        if (geometry) {
          geometry.center();

          const mesh = new Mesh(geometry, material);
          group.add(mesh);
        }
      }
    }

    this.add(group);
  }
}

class Floor extends Group {
  constructor() {
    super();

    this.initReflector();
  }

  initReflector() {
    this.reflector = new Reflector();
  }

  async initMesh() {
    const { scene, loadTexture } = WorldController;

    const geometry = new PlaneGeometry(100, 100);

    const map = await loadTexture(
      "assets/textures/pbr/polished_concrete_basecolor.jpg"
    );
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(16, 16);

    const { fog } = scene;

    const material = new ReflectorMaterial({
      map,
      fog,
      dithering: true
    });
    material.uniforms.tReflect = this.reflector.renderTargetUniform;
    material.uniforms.uMatrix = this.reflector.textureMatrixUniform;

    const mesh = new Mesh(geometry, material);
    mesh.position.y = -1.6;
    mesh.rotation.x = -Math.PI / 2;
    mesh.add(this.reflector);

    mesh.onBeforeRender = (renderer, scene, camera) => {
      this.visible = false;
      this.reflector.update(renderer, scene, camera);
      this.visible = true;
    };

    this.add(mesh);
  }

  /**
   * Public methods
   */

  resize = (width, height) => {
    width = MathUtils.floorPowerOfTwo(width) / 2;
    height = 1024;

    this.reflector.setSize(width, height);
  };
}

class SceneView extends Group {
  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    this.floor = new Floor();
    this.add(this.floor);

    this.triangle = new Triangle();
    this.add(this.triangle);
  }

  /**
   * Public methods
   */

  resize = (width, height) => {
    this.floor.resize(width, height);
  };

  ready = () => Promise.all([this.floor.initMesh(), this.triangle.initMesh()]);
}

class SceneController {
  static init(view) {
    this.view = view;
  }

  /**
   * Public methods
   */

  static resize = (width, height) => {
    this.view.resize(width, height);
  };

  static update = () => {};

  static animateIn = () => {
    this.view.visible = true;
  };

  static ready = () => this.view.ready();
}

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);

class RenderManager {
  static init(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.luminosityThreshold = 0.1;
    this.bloomStrength = 0.3;
    this.bloomRadius = 0.75;
    this.enabled = true;

    this.initRenderer();
  }

  static initRenderer() {
    const { screenTriangle, resolution } = WorldController;

    // Fullscreen triangle
    this.screenScene = new Scene();
    this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.screen = new Mesh(screenTriangle);
    this.screen.frustumCulled = false;
    this.screenScene.add(this.screen);

    // Render targets
    this.renderTargetA = new WebGLRenderTarget(1, 1, {
      format: RGBFormat,
      depthBuffer: false
    });

    this.renderTargetB = this.renderTargetA.clone();

    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    this.renderTargetBright = this.renderTargetA.clone();

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal.push(this.renderTargetA.clone());
      this.renderTargetsVertical.push(this.renderTargetA.clone());
    }

    this.renderTargetA.depthBuffer = true;

    // FXAA material
    this.fxaaMaterial = new FXAAMaterial();
    this.fxaaMaterial.uniforms.uResolution = resolution;

    // Luminosity high pass material
    this.luminosityMaterial = new LuminosityMaterial();
    this.luminosityMaterial.uniforms.uLuminosityThreshold.value = this.luminosityThreshold;

    // Gaussian blur materials
    this.blurMaterials = [];

    const kernelSizeArray = [3, 5, 7, 9, 11];

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.blurMaterials.push(new UnrealBloomBlurMaterial(kernelSizeArray[i]));
      this.blurMaterials[i].uniforms.uResolution.value = new Vector2();
    }

    // Bloom composite material
    const bloomFactors = [1, 0.8, 0.6, 0.4, 0.2];

    for (let i = 0, l = this.nMips; i < l; i++) {
      const factor = bloomFactors[i];
      bloomFactors[i] =
        this.bloomStrength * mix(factor, 1.2 - factor, this.bloomRadius);
    }

    this.bloomCompositeMaterial = new BloomCompositeMaterial(this.nMips);
    this.bloomCompositeMaterial.uniforms.tBlur1.value = this.renderTargetsVertical[0].texture;
    this.bloomCompositeMaterial.uniforms.tBlur2.value = this.renderTargetsVertical[1].texture;
    this.bloomCompositeMaterial.uniforms.tBlur3.value = this.renderTargetsVertical[2].texture;
    this.bloomCompositeMaterial.uniforms.tBlur4.value = this.renderTargetsVertical[3].texture;
    this.bloomCompositeMaterial.uniforms.tBlur5.value = this.renderTargetsVertical[4].texture;
    this.bloomCompositeMaterial.uniforms.uBloomFactors.value = bloomFactors;

    // Composite material
    this.compositeMaterial = new CompositeMaterial();
  }

  /**
   * Public methods
   */

  static resize = (width, height, dpr) => {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);

    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.renderTargetA.setSize(width, height);
    this.renderTargetB.setSize(width, height);

    width = MathUtils.floorPowerOfTwo(width) / 2;
    height = MathUtils.floorPowerOfTwo(height) / 2;

    this.renderTargetBright.setSize(width, height);

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal[i].setSize(width, height);
      this.renderTargetsVertical[i].setSize(width, height);

      this.blurMaterials[i].uniforms.uResolution.value.set(width, height);

      width = width / 2;
      height = height / 2;
    }
  };

  static update = () => {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;

    if (!this.enabled) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      return;
    }

    const screenScene = this.screenScene;
    const screenCamera = this.screenCamera;

    const renderTargetA = this.renderTargetA;
    const renderTargetB = this.renderTargetB;
    const renderTargetBright = this.renderTargetBright;
    const renderTargetsHorizontal = this.renderTargetsHorizontal;
    const renderTargetsVertical = this.renderTargetsVertical;

    // Scene pass
    renderer.setRenderTarget(renderTargetA);
    renderer.render(scene, camera);

    // FXAA pass
    this.fxaaMaterial.uniforms.tMap.value = renderTargetA.texture;
    this.screen.material = this.fxaaMaterial;
    renderer.setRenderTarget(renderTargetB);
    renderer.render(screenScene, screenCamera);

    // Extract bright areas
    this.luminosityMaterial.uniforms.tMap.value = renderTargetB.texture;
    this.screen.material = this.luminosityMaterial;
    renderer.setRenderTarget(renderTargetBright);
    renderer.render(screenScene, screenCamera);

    // Blur all the mips progressively
    let inputRenderTarget = renderTargetBright;

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.screen.material = this.blurMaterials[i];

      this.blurMaterials[i].uniforms.tMap.value = inputRenderTarget.texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionX;
      renderer.setRenderTarget(renderTargetsHorizontal[i]);
      renderer.render(screenScene, screenCamera);

      this.blurMaterials[i].uniforms.tMap.value = this.renderTargetsHorizontal[
        i
      ].texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionY;
      renderer.setRenderTarget(renderTargetsVertical[i]);
      renderer.render(screenScene, screenCamera);

      inputRenderTarget = renderTargetsVertical[i];
    }

    // Composite all the mips
    this.screen.material = this.bloomCompositeMaterial;
    renderer.setRenderTarget(renderTargetsHorizontal[0]);
    renderer.render(screenScene, screenCamera);

    // Composite pass (render to screen)
    this.compositeMaterial.uniforms.tScene.value = renderTargetB.texture;
    this.compositeMaterial.uniforms.tBloom.value =
      renderTargetsHorizontal[0].texture;
    this.screen.material = this.compositeMaterial;
    renderer.setRenderTarget(null);
    renderer.render(screenScene, screenCamera);
  };
}

class CameraController {
  static init(camera) {
    this.camera = camera;

    this.mouse = new Vector2();
    this.lookAt = new Vector3(0, 0, -2);
    this.origin = new Vector3();
    this.target = new Vector3();
    this.targetXY = new Vector2(5, 1);
    this.origin.copy(this.camera.position);

    this.lerpSpeed = 0.02;
    this.enabled = false;

    this.addListeners();
  }

  static addListeners() {
    Stage.element.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  /**
   * Event handlers
   */

  static onPointerDown = e => {
    this.onPointerMove(e);
  };

  static onPointerMove = ({ clientX, clientY }) => {
    if (!this.enabled) {
      return;
    }

    this.mouse.x = (clientX / Stage.width) * 2 - 1;
    this.mouse.y = 1 - (clientY / Stage.height) * 2;
  };

  static onPointerUp = e => {
    this.onPointerMove(e);
  };

  /**
   * Public methods
   */

  static resize = (width, height) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (width < height) {
      this.camera.position.z = 14;
    } else {
      this.camera.position.z = 10;
    }

    this.origin.z = this.camera.position.z;
  };

  static update = () => {
    if (!this.enabled) {
      return;
    }

    this.target.x = this.origin.x + this.targetXY.x * this.mouse.x;
    this.target.y = this.origin.y + this.targetXY.y * this.mouse.y;
    this.target.z = this.origin.z;

    this.camera.position.lerp(this.target, this.lerpSpeed);
    this.camera.lookAt(this.lookAt);
  };

  static animateIn = () => {
    this.enabled = true;
  };
}

class WorldController {
  static init() {
    this.initWorld();
    this.initLights();
    this.initLoaders();

    this.addListeners();
  }

  static initWorld() {
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      stencil: false
    });
    this.element = this.renderer.domElement;

    // Tone mapping
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // 3D scene
    this.scene = new Scene();
    this.scene.background = new Color(Config.BG_COLOR);
    this.scene.fog = new Fog(Config.BG_COLOR, 1, 100);
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.z = 10;
    this.camera.lookAt(this.scene.position);

    // Global geometries
    this.screenTriangle = getFullscreenTriangle();

    // Global uniforms
    this.resolution = new Uniform(new Vector2());
    this.aspect = new Uniform(1);
    this.time = new Uniform(0);
    this.frame = new Uniform(0);
  }

  static initLights() {
    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  static initLoaders() {
    this.textureLoader = new TextureLoader();
    this.svgLoader = new SVGLoader();
  }

  static addListeners() {
    this.renderer.domElement.addEventListener("touchstart", this.onTouchStart);
  }

  /**
   * Event handlers
   */

  static onTouchStart = e => {
    e.preventDefault();
  };

  /**
   * Public methods
   */

  static resize = (width, height, dpr) => {
    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.resolution.value.set(width, height);
    this.aspect.value = width / height;
  };

  static update = (time, delta, frame) => {
    this.time.value = time;
    this.frame.value = frame;
  };

  static getTexture = (path, callback) =>
    this.textureLoader.load(path, callback);

  static loadTexture = path => this.textureLoader.loadAsync(path);

  static loadSVG = path => this.svgLoader.loadAsync(path);
}

class App {
  static async init() {
    this.initWorld();
    this.initViews();
    this.initControllers();

    this.addListeners();
    this.onResize();

    await Promise.all([
      WorldController.textureLoader.ready(),
      SceneController.ready()
    ]);

    CameraController.animateIn();
    SceneController.animateIn();
  }

  static initWorld() {
    WorldController.init();
    Stage.add(WorldController.element);
  }

  static initViews() {
    this.view = new SceneView();
    WorldController.scene.add(this.view);
  }

  static initControllers() {
    const { renderer, scene, camera } = WorldController;

    CameraController.init(camera);
    SceneController.init(this.view);
    RenderManager.init(renderer, scene, camera);
  }

  static addListeners() {
    Stage.events.on(Events.RESIZE, this.onResize);
    ticker.add(this.onUpdate);
  }

  /**
   * Event handlers
   */

  static onResize = () => {
    const { width, height, dpr } = Stage;

    WorldController.resize(width, height, dpr);
    CameraController.resize(width, height);
    SceneController.resize(width, height);
    RenderManager.resize(width, height, dpr);
  };

  static onUpdate = (time, delta, frame) => {
    WorldController.update(time, delta, frame);
    CameraController.update();
    SceneController.update();
    RenderManager.update(time, delta, frame);
  };
}

App.init();
