export const vertexShader = `
  uniform float pointMultiplier;

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
    gl_PointSize = size * pointMultiplier / gl_Position.w * 10.0;
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
  uniform sampler2D depthTexture;
  uniform float nf;
  uniform float f_sub_n;
  uniform float f;
  uniform vec2 resolution;

  uniform float fCamNear;
  uniform float fCamFar;

  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vBlend;
  varying float vZ;
  varying vec2 vUv;
  varying float vSize;

  float fadeEdge( float particleDepth, float sceneDepth ){
    // margin makes it blend through the solid objects a little bit more, creating illusion of density
    float extraMargin = 0.015;
    float a = ( sceneDepth+extraMargin - particleDepth ) * 120.0;
    if( a <= 0.0 ) return 0.0;
    if( a >= 1.0 ) return 1.0;

    if( a < 0.5 ) a = 2.0 * a * a;
    else a = -2.0 * pow( a - 1.0 , 2.0 ) + 1.0;

    return a;
  }


  float getLinearDepth( float fragCoordZ ) {

    float viewZ = perspectiveDepthToViewZ( fragCoordZ, fCamNear, fCamFar );
    return viewZToOrthographicDepth( viewZ, fCamNear, fCamFar );
  }

  float GetDepth(vec2 uv) {
    float z_final = texture2D(depthTexture, uv).x;
    float viewZ = perspectiveDepthToViewZ(z_final, fCamNear, fCamFar);
    return viewZToOrthographicDepth(viewZ, fCamNear, fCamFar);
    // return nf / (f_sub_n * z_final - f);

  }
  void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
    // gl_FragColor = texture2D(diffuseTexture, coords) ;
    // gl_FragColor.xyz *= gl_FragColor.w;
    // gl_FragColor.a *= vBlend;

    vec2 screenCoords = gl_FragColor.xy / resolution.xy;
    float sceneDepth = GetDepth(screenCoords);
    // float curDepth = vZ;
    float curDepth = viewZToOrthographicDepth(vZ, fCamNear, fCamFar);
    float falloffRange = vSize * 0.25;
    float diff = clamp(abs(curDepth - sceneDepth) / 1.0, 0.0, 1.0);

    // diff = smoothstep(0.0, 1.0, diff);

    gl_FragColor.a *= diff;

    // vec2 screenCoords = gl_FragColor.xy / resolution.xy;
    // float sceneDepth = texture2D(depthTexture, screenCoords).r;
    // sceneDepth = getLinearDepth(sceneDepth);

    // float curDepth = getLinearDepth(gl_FragCoord.z);
    // if(curDepth == vZ) {
    //   gl_FragColor.r = 1.0;
    //   gl_FragColor.g = 0.0;
    //   gl_FragColor.b = 0.0;

    // } else {
    //   gl_FragColor.r = sceneDepth/10.0 ;
    //   gl_FragColor.g = sceneDepth/10.0 ;
    //   gl_FragColor.b = sceneDepth/10.0 ;
    // }
    // float alphaScale = fadeEdge(curDepth, sceneDepth);
    // gl_FragColor.r = alphaScale;
    // gl_FragColor.g = alphaScale;
    // gl_FragColor.b = alphaScale;
    // gl_FragColor.a *= sceneDepth;
  }
`

function vertexShader() {
  const paramScale = parameters.getParameterByName(ParticleParameters.Scale);
  const paramColor = parameters.getParameterByName(ParticleParameters.Color);


  const parameterUniforms = parameterArray.map(function (param) {
    return `uniform vec4 ${computeParameterUniformName(param)};`;
  }).join('\n');

  return `
    uniform float cameraNear;
    uniform float cameraFar;
    uniform vec2 resolution;
    uniform sampler2D tParameterSheet;
    
    ${parameterUniforms}
    
    attribute float size;
    attribute vec4 atlasPatch;
    attribute float age;
    attribute float deathAge;
    attribute float layerPosition;
    attribute float rotation;
      
    varying vec4 vPatch;
          
    varying float vSize;

    varying float vFadeDistance;

    varying vec4 vColor;

    varying vec2 vRotationMultiplier;

    ${genParameterDecoderScalar()}
    ${genParameterDecoderVector4()}

    void main() {
      float relativeAge = clamp(age / deathAge, 0.0, 1.0);
      
      float paramScale = ${genParameterSampleValue('relativeAge', paramScale)};
      vColor = ${genParameterSampleValue('relativeAge', paramColor)};
      
      vRotationMultiplier = vec2(cos(rotation),sin(rotation));
      
      vSize = size * paramScale;
      vPatch = atlasPatch;
                    
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
      #ifdef DEPTH_SOFT_ENABLED
    
      vFadeDistance = 1.0 / vSize;
  
      #endif
  
      float radius = vSize/2.0;
            
      gl_PointSize = resolution.y * projectionMatrix[1][1] * radius / gl_Position.w;
    }
  `;
}


function fragmentShader() {
  return `
    #include <packing>
    uniform sampler2D tSpriteAtlas;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec2 resolution;
    
    varying float vFadeDistance;
    varying vec4 vPatch;
    varying float vSize;
    varying vec4 vColor;
    varying vec2 vRotationMultiplier;

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
      
      if ((inputDepth < 1.0) && (inputDepth >= 0.0)){
          zFade = 0.5 * pow(saturate(2.0*((inputDepth > 0.5) ? (1.0 - inputDepth) : inputDepth)), 2.0);
                zFade = (inputDepth > 0.5) ? (1.0 - zFade) : zFade;
      }else{
          zFade = 1.0;
      }
      
      return zFade;
    }

    void main() {
      float fragmentDepth = gl_FragCoord.z;
      
      vec2 pixelPosition = gl_FragCoord.xy / resolution;
      
      float sceneDepth =  texture2D( tDepth, pixelPosition ).x;
      
      #ifdef DEPTH_READ_ENABLED
      
      if(fragmentDepth + ${DEPTH_ERROR_MARGIN} > sceneDepth){
        discard;
      }
      
      #endif
    
      vec2 centeredUv = gl_PointCoord - 0.5;
      
      vec2 texelCoordinate = vec2( centeredUv.x* vRotationMultiplier.x - centeredUv.y* vRotationMultiplier.y, centeredUv.x * vRotationMultiplier.y + centeredUv.y * vRotationMultiplier.x) + 0.5;
      
      texelCoordinate = clamp(texelCoordinate, vec2(0.0), vec2(1.0) );
                        
      vec2 uv = texelCoordinate*vPatch.zw + vPatch.xy;
      
      vec4 spriteColor = texture2D( tSpriteAtlas, uv );
      
      if(spriteColor.a == 0.0){
        discard;
      }
      
      vec4 texel = texture2D( tSpriteAtlas, uv ) *vColor;
      
      
      #ifdef DEPTH_SOFT_ENABLED
      
      float zFade = calculateFade(fragmentDepth, sceneDepth);
      
      texel.a *= zFade;
      
      #endif
                
      gl_FragColor = texel; 
    }`;
}