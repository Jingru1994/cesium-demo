import * as THREE from "three";

const SmokeOptions = {
  life: 13.0,
  size: 2.0,
  xVelocity: 0.0,
  yVelocity: 5.0,
  zVelocity: 0.0,
  blend: 1.0,
  position: [0, 12, 0],
  type: "smoke"
};

const SmokeSpline = {
  alphaTween: [
    [0.0, 0.0],
    [0.1, 1.0],
    [0.5, 1.0],
    [1.0, 0.0]
  ],
  colorTween: [
    [0.0, new THREE.Color(0x0f0f0f)],
    [0.7, new THREE.Color(0x000000)],
    [1.0, new THREE.Color(0x000000)]
  ],
  sizeTween: [
    [0.0, 1.0],
    [0.5, 8.0],
    [1.0, 16.0]
  ]
};

const FireOptions = {
  life: 13.0,
  size: 2.0,
  xVelocity: 0.0,
  yVelocity: 5.0,
  zVelocity: 0.0,
  blend: 0.0,
  position: [0, 0, 0],
  type: "fire"
};

const FireSpline = {
  alphaTween: [
    [0.0, 0.0],
    [0.1, 1.0],
    [0.5, 1.0],
    [1.0, 0.0]
  ],
  colorTween: [
    [0.0, new THREE.Color(0xffff80)],
    [1.0, new THREE.Color(0xff8080)]
  ],
  sizeTween: [
    [0.0, 0.5],
    [0.25, 7.0],
    [0.5, 2.5],
    [1.0, 0.0]
  ]
};

const SparkOptions = {
  life: 2.0,
  size: 0.8,
  velocity: new THREE.Vector3(0, 5, 0),
  xVelocity: 4.0,
  yVelocity: 10.0,
  zVelocity: 4.0,
  blend: 0.0,
  position: [0, 10, 0],
  type: "spark"
};

const SparkSpline = {
  alphaTween: [
    [0.0, 0.0],
    [0.1, 1.0],
    [0.9, 1.0],
    [1.0, 0.0]
  ],
  colorTween: [
    [0.0, new THREE.Color(0xff8080)],
    [0.1, new THREE.Color(0xffffff)]
  ],
  sizeTween: [
    [0.0, 1.0],
    [1.0, 1.0]
  ]
};

const Splines = {
  smoke: SmokeSpline,
  fire: FireSpline,
  spark: SparkSpline
};

export {
  SmokeOptions,
  FireOptions,
  SparkOptions,
  SmokeSpline,
  FireSpline,
  SparkSpline,
  Splines
};
