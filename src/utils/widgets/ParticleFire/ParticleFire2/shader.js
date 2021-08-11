export const vertexShader = `
  uniform float pointMultiplier;
  uniform float sizeFactor;

  attribute float size;
  attribute float angle;
  attribute float blend;
  attribute vec4 colour;

  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vBlend;
  varying float vZ;
  varying vec2 vUv;
  varying float vSize;

  
  void main() {

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * pointMultiplier / gl_Position.w * sizeFactor;
    vAngle = vec2(cos(angle), sin(angle));
    vColour = colour;
    vBlend = blend;
    vZ = mvPosition.z;
    vUv = uv;
    vSize = size;
  }
` 

export const fragmentShader = `
  #include <packing>
  #include <map_particle_pars_fragment>

  uniform sampler2D diffuseTexture;
  uniform vec2 resolution;

  uniform float fCamNear;
  uniform float fCamFar;

  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vBlend;
  varying float vZ;
  varying vec2 vUv;
  varying float vSize;

  void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
    gl_FragColor.xyz *= gl_FragColor.w;
    gl_FragColor.a *= vBlend;
   
  }
`