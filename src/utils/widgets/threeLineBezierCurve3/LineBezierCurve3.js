import * as THREE from "three";
//THERE.CurvePath是各类Curve的组合的抽象类
class LineBezierCurve3 extends THREE.CurvePath {
  constructor(nodes = [], radius = 0.8) {
    super();
    radius = 0.5 + radius / 2;
    if (nodes.length < 2) {
      return;
    }
    nodes.forEach((item, index) => {
      if (index) {
        // filter: first
        const end = new THREE.Vector3(...item);
        const start = new THREE.Vector3(...nodes[index - 1]);
        let left = start.clone();
        let right = end.clone();
        if (index !== 1) {
          left = start
            .clone()
            .sub(end)
            .multiplyScalar(radius)
            .add(end);
        }
        if (nodes.length !== index + 1) {
          right = end
            .clone()
            .sub(start)
            .multiplyScalar(radius)
            .add(start);
        }
        this.curves.push(new THREE.LineCurve3(left, right));
      }
      if (index && nodes.length !== index + 1) {
        // filter: first and last
        const center = new THREE.Vector3(...item);
        const start = new THREE.Vector3(...nodes[index - 1]);
        const end = new THREE.Vector3(...nodes[index + 1]);
        this.curves.push(
          new THREE.QuadraticBezierCurve3(
            center
              .clone()
              .sub(start)
              .multiplyScalar(radius)
              .add(start),
            center,
            end
              .clone()
              .sub(center)
              .multiplyScalar(1 - radius)
              .add(center)
          )
        );
      }
    });
  }
}

export default LineBezierCurve3;
