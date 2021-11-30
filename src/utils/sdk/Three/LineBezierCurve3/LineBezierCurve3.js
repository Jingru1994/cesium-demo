import * as THREE from "three";
/**
 * 直线贝塞尔组合曲线
 *
 * @author Dongjingru
 * @alias LineBezierCurve3 转角
 * @constructor
 */
class LineBezierCurve3 extends THREE.CurvePath {
  /**
   *LineBezierCurve3构造函数
   *
   * @param {Array} nodes 线段点集合[x,y,z]，至少梁哥
   * @param {Boolean} closed 线段是否自动闭合
   * @param {Number} radius 转角半径
   */
  constructor(nodes = [], closed = false, radius) {
    super();
    if (nodes.length < 2) {
      throw Error("The length of nodes must more than 2");
    }
    if (!radius) {
      let distance = 0;
      let a, b;
      nodes.forEach((item, index) => {
        if (index) {
          a = new THREE.Vector3(...item);
          b = new THREE.Vector3(...nodes[index - 1]);

          distance += a.distanceTo(b);
        }
      });
      radius = distance * 0.015;
    }

    nodes.forEach((item, index) => {
      if (index) {
        // filter: first
        const end = new THREE.Vector3(...item);
        const start = new THREE.Vector3(...nodes[index - 1]);
        let left = start.clone();
        let right = end.clone();
        if (index !== 1 || closed) {
          left = start.clone().add(
            end
              .clone()
              .sub(start)
              .normalize()
              .multiplyScalar(radius)
          );
        }
        if (nodes.length !== index + 1 || closed) {
          right = end.clone().add(
            start
              .clone()
              .sub(end)
              .normalize()
              .multiplyScalar(radius)
          );
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
            center.clone().add(
              start
                .clone()
                .sub(center)
                .normalize()
                .multiplyScalar(radius)
            ),
            center,
            center.clone().add(
              end
                .clone()
                .sub(center)
                .normalize()
                .multiplyScalar(radius)
            )
          )
        );
      }
    });

    if (closed) {
      const len = nodes.length - 1;
      let center = new THREE.Vector3(...nodes[len]);
      let start = new THREE.Vector3(...nodes[len - 1]);
      let end = new THREE.Vector3(...nodes[0]);
      this.curves.push(
        new THREE.QuadraticBezierCurve3(
          center.clone().add(
            start
              .clone()
              .sub(center)
              .normalize()
              .multiplyScalar(radius)
          ),
          center,
          center.clone().add(
            end
              .clone()
              .sub(center)
              .normalize()
              .multiplyScalar(radius)
          )
        )
      );
      const left = new THREE.Vector3(...nodes[len]);
      const right = new THREE.Vector3(...nodes[0]);
      this.curves.push(
        new THREE.LineCurve3(
          left.clone().add(
            right
              .clone()
              .sub(left)
              .normalize()
              .multiplyScalar(radius)
          ),
          right.clone().add(
            left
              .clone()
              .sub(right)
              .normalize()
              .multiplyScalar(radius)
          )
        )
      );
      center = new THREE.Vector3(...nodes[0]);
      start = new THREE.Vector3(...nodes[len]);
      end = new THREE.Vector3(...nodes[1]);
      this.curves.push(
        new THREE.QuadraticBezierCurve3(
          center.clone().add(
            start
              .clone()
              .sub(center)
              .normalize()
              .multiplyScalar(radius)
          ),
          center,
          center.clone().add(
            end
              .clone()
              .sub(center)
              .normalize()
              .multiplyScalar(radius)
          )
        )
      );
    }
  }
}

export default LineBezierCurve3;
