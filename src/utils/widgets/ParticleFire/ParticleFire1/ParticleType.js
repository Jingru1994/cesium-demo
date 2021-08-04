import * as THREE from 'three'

const SmokeOptions = {
    life: 13.0,
    size: 2.0,
    // velocity: new THREE.Vector3(0, 5, 0),
    xVelocity: 0.0,
    yVelocity: 5.0,
    zVelocity: 0.0,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    quantityFactor: 1,
    diffuseTexture: new THREE.TextureLoader().load('images/fire3.png'),
    alphaLegend: [[0.0, 0.0], [0.1, 1.0], [0.5, 1.0], [1.0, 0.0]],
    colourLegend: [[0.0, new THREE.Color(0x0f0f0f)], [0.7, new THREE.Color(0x000000)], [1.0, new THREE.Color(0x000000)]],
    sizeLegend: [[0.0, 1.0], [0.5,8.0], [1.0, 16.0]]
}

const FireOptions = {
    life: 13.0,
    size: 2.0,
    xVelocity: 0.0,
    yVelocity: 5.0,
    zVelocity: 0.0,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
    quantityFactor: 1,
    diffuseTexture: new THREE.TextureLoader().load('images/fire3.png'),
    alphaLegend: [[0.0, 0.0], [0.1, 1.0], [0.5, 1.0], [1.0, 0.0]],
    colourLegend: [[0.0, new THREE.Color(0xFFFF80)], [1.0, new THREE.Color(0xFF8080)]],
    sizeLegend: [[0.0, 0.5], [0.25, 7.0], [0.5, 2.5], [1.0, 0.0]]
}

const SparkOptions = {
    life: 2.0,
    size: 0.5,
    velocity: new THREE.Vector3(0, 5, 0),
    xVelocity: 3.0,
    yVelocity: 10.0,
    zVelocity: 3.0,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    quantityFactor: 2,
    diffuseTexture: new THREE.TextureLoader().load('images/fire3.png'),
    alphaLegend: [[0.0, 0.0], [0.1, 1.0], [0.9, 1.0], [1.0, 0.0]],
    colourLegend: [[0.0, new THREE.Color(0xFF8080)], [0.1, new THREE.Color(0xFFFFFF)]],
    sizeLegend: [[0.0, 1.0], [1.0, 1.0]]
}

export {SmokeOptions, FireOptions, SparkOptions}