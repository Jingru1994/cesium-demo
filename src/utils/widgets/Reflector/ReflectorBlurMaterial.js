import { GLSL3, NoBlending, RawShaderMaterial, Uniform, Vector2 } from "three";

import vertexShader from "./shader/ReflectorBlurPass.vert";
import fragmentShader from "./shader/ReflectorBlurPass.frag";

export class ReflectorBlurMaterial extends RawShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        tMap: new Uniform(null),
        uBluriness: new Uniform(1),
        uDirection: new Uniform(new Vector2(1, 0)),
        uResolution: new Uniform(new Vector2())
      },
      vertexShader,
      fragmentShader,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false
    });
  }
}
