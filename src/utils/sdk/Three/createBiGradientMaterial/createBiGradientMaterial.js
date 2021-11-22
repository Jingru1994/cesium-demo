import * as THREE from "three";
import GradientType from "../GradientType/GradientType";
/**
 * 创建渐变材质
 *
 * @param {Object} options 选项。
 * @param {THREE.Scene} options.scene 三维场景对象。
 * @param {String} [options.color1] 渐变色第一个颜色。
 * @param {String} [options.color2] 渐变色第二个颜色。
 * @param {GradientType} [options.type] 渐变类型，三个可选项，水平，倾斜，径向。
 * @param {NUmber} [options.opcity] 材质透明度。
 * @param {shadowPower} [options.shadowPower] 接受阴影强度。
 */
function createBiGradientMaterial(options) {
  if (!options) {
    throw Error("Using createBiGradientMaterial must provide options");
  }
  const scene = options.scene;
  const color1 = options.color1 || "#FFFB00";
  const color2 = options.color2 || "#008A29";
  const opacity = Number(options.opcity) || 1.0;
  const type = options.type || GradientType.HORIZONTAL;
  const shadowPower = options.shadowPower || 0.5;
  const fog = scene.fog ? true : false;
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    {
      opacity: { type: "f", value: opacity }
    },
    {
      color1: { value: new THREE.Color(color1) }
    },
    {
      color2: { value: new THREE.Color(color2) }
    },
    {
      shadowPower: { value: shadowPower }
    },
    {
      type: { value: type }
    }
  ]);
  if (fog) {
    uniforms = THREE.UniformsUtils.merge([
      uniforms,
      {
        fogColor: { type: "c", value: scene.fog.color }
      },
      {
        fogNear: { type: "f", value: scene.fog.near }
      },
      {
        fogFar: { type: "f", value: scene.fog.far }
      }
    ]);
  }
  console.log(uniforms);
  let material = new THREE.ShaderMaterial({
    fog: fog,
    lights: true,
    uniforms: uniforms,
    vertexShader: [
      "varying vec2 vUv;",
      "varying vec3 vPosition;",
      THREE.ShaderChunk["common"],
      // THREE.ShaderChunk[ "packing" ],
      THREE.ShaderChunk["bsdfs"],
      THREE.ShaderChunk["shadowmap_pars_vertex"],
      "void main() {",
      "   vUv = uv;",
      "   vPosition = position;",
      THREE.ShaderChunk["beginnormal_vertex"],
      THREE.ShaderChunk["defaultnormal_vertex"],
      THREE.ShaderChunk["begin_vertex"],
      THREE.ShaderChunk["project_vertex"],
      THREE.ShaderChunk["worldpos_vertex"],
      THREE.ShaderChunk["shadowmap_vertex"],
      "}"
    ].join("\n"),
    fragmentShader: [
      THREE.ShaderChunk["common"],
      THREE.ShaderChunk["packing"],
      THREE.ShaderChunk["bsdfs"],
      THREE.ShaderChunk["lights_pars_begin"],
      THREE.ShaderChunk["shadowmap_pars_fragment"],
      THREE.ShaderChunk["shadowmask_pars_fragment"],
      "uniform float opacity;",
      "uniform vec3 color1;",
      "uniform vec3 color2;",
      "uniform float shadowPower;",
      "varying vec2 vUv;",
      "uniform vec3 fogColor;",
      "uniform float fogNear;",
      "uniform float fogFar;",
      "uniform float type;",
      "void main() {",
      "   float a;",
      "   if(type == 1.0){",
      "       a = vUv.x;",
      "   } else if(type == 2.0){",
      "       a = abs(vUv.x + vUv.y) / 1.41421;",
      "   } else {",
      "       a = distance(vec2(vUv.x,vUv.y),vec2(0.5));",
      "   }",
      "   gl_FragColor = vec4(mix(color1, color2, a)*(getShadowMask()==0.0?shadowPower:1.0), 1.0);",
      "   #ifdef USE_FOG",
      "       #ifdef USE_LOGDEPTHBUF_EXT",
      "           float depth = gl_FragDepthEXT / gl_FragCoord.w;",
      "       #else",
      "           float depth = gl_FragCoord.z / gl_FragCoord.w;",
      "       #endif",
      "       float fogFactor = smoothstep( fogNear, fogFar, depth );",
      "       gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);",
      "   #endif",
      "}"
    ].join("\n")
  });
  return material;
}
export default createBiGradientMaterial;
