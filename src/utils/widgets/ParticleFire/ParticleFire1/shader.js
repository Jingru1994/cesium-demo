export const vertexShader = `
  uniform float pointMultiplier;
  uniform float sizeFactor;

  attribute float size;
  attribute float angle;
  attribute vec4 colour;

  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vZ;
  varying vec2 vUv;
  varying float vSize;
  varying float vFadeDistance;

  
  void main() {

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * pointMultiplier / gl_Position.w * sizeFactor;
    vAngle = vec2(cos(angle), sin(angle));
    vColour = colour;
    vZ = mvPosition.z;
    vUv = uv;
    vSize = size;
    vFadeDistance = 0.5 / size;
  }
`;

export const fragmentShader = `
  #include <packing>
  #include <map_particle_pars_fragment>

  uniform sampler2D diffuseTexture;
  uniform sampler2D depthTexture;
  uniform vec2 resolution;
  uniform float cameraNear;
  uniform float cameraFar;

  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vZ;
  varying vec2 vUv;
  varying float vSize;
  varying float vFadeDistance;

  float depthToLinear( float z ) {
    float z_n = 2.0 * z - 1.0;
    
    float z_e = 2.0 * cameraNear * cameraFar / (cameraFar + cameraNear - z_n * (cameraFar - cameraNear));

    return z_e;
  }
  
  float calculateFade(in float particleDepth, in float sceneDepth){
    float zFade;
                            
    float linearParticleDepth = depthToLinear(particleDepth);
    
    float linearSceneDepth = depthToLinear(sceneDepth);
              
    float depthDelta = (linearSceneDepth - linearParticleDepth);
                        
    float inputDepth = depthDelta* vFadeDistance;
    
    if ((inputDepth < 1.0) && (inputDepth > -0.1)){
      zFade = 0.5 * pow(clamp(2.0*((inputDepth > 0.5) ? (1.0 - inputDepth) : inputDepth),0.0,1.0), 2.0);
      zFade = (inputDepth > 0.5) ? (1.0 - zFade) : zFade;
      // zFade = clamp(abs(inputDepth) / 1.0, 0.0, 1.0);
    }else{
      zFade = 1.0;
    }
    
    return zFade;
  }

  void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;

    float fragmentDepth = gl_FragCoord.z;
    vec2 pixelPosition = gl_FragCoord.xy / resolution.xy;
    float sceneDepth =  texture2D( depthTexture, pixelPosition ).x;
    float zFade = calculateFade(fragmentDepth, sceneDepth);
    gl_FragColor.a *= zFade;
  }
`;
