import * as THREE from "three";
class LinearSpline {
  constructor(points) {
    this.points = points || [];
  }
  get(t) {
    if (this.points.length == 0) return;
    let i = 0,
      n = this.points.length;
    while (i < n && t > this.points[i][0]) i++;
    if (i === 0) return this.points[0][1];
    if (i === n) return this.points[n - 1][1];
    const ratio =
      (t - this.points[i - 1][0]) / (this.points[i][0] - this.points[i - 1][0]);
    if (this.points[0][1] instanceof THREE.Color) {
      return this.points[i - 1][1].clone().lerp(this.points[i][1], ratio);
    } else {
      return (
        this.points[i - 1][1] +
        ratio * (this.points[i][1] - this.points[i - 1][1])
      );
    }
  }
}
export default LinearSpline;
