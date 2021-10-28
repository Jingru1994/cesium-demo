import * as Cesium from "cesium/Cesium.js";
import ScreenSpaceEventHandler from "cesium/Core/ScreenSpaceEventHandler";
import Matrix3 from "cesium/Core/Matrix3";
import Matrix4 from "cesium/Core/Matrix4";
import Cartesian3 from "cesium/Core/Cartesian3";
import PrimitiveCollection from "cesium/Scene/PrimitiveCollection";
import Color from "cesium/Core/Color";
import ScreenSpaceEventType from "cesium/Core/ScreenSpaceEventType";
import CesiumMath from "cesium/Core/Math";
import Transforms from "cesium/Core/Transforms";
import SphereGeometry from "cesium/Core/SphereGeometry";
import PerInstanceColorAppearance from "cesium/Scene/PerInstanceColorAppearance";
import GeometryInstance from "cesium/Core/GeometryInstance";
import ColorGeometryInstanceAttribute from "cesium/Core/ColorGeometryInstanceAttribute";
import Primitive from "cesium/Scene/Primitive";
import Quaternion from "cesium/Core/Quaternion";
import ArrowPolyline from "./LineAxis";
// import EventConstant from '../constant/EventConstant'
import AxisSphere from "./SphereAxis";

export default class TranslationController {
  /**
   * 视图
   * @type {Viewer}
   */
  viewer = null;

  /**
   * 模型
   * @type {Cesium.Model}
   */
  model = null;

  /**
   * 模型位置
   * @type {Cesium.Cartesian3}
   */
  position = null;

  /**
   * z轴
   * @type {ArrowPolyline}
   */
  axisZ = null;

  /**
   * x轴
   * @type {ArrowPolyline}
   */
  axisX = null;

  /**
   * y轴
   * @type {ArrowPolyline}
   */
  axisY = null;

  /**
   * 操作杆集合
   * @type {Cesium.PrimitiveCollection}
   */
  primitives = null;

  /**
   * 从摄像头发出与视窗上一点相交的射线
   */
  pickRay = new Cesium.Ray();

  /**
   * 当前操作轴
   * @type {ArrowPolyline}
   */
  axis = null;

  /**
   * Z旋转轴
   * @type {AxisSphere}
   */
  axisSphereZ = null;

  /**
   * X旋转轴
   * @type {AxisSphere}
   */
  axisSphereX = null;

  /**
   * Y旋转轴
   * @type {AxisSphere}
   */
  axisSphereY = null;

  /**
   * 辅助球
   * @type {Cesium.Primitive}
   */
  auxiliaryBall = null;

  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  }

  /**
   * 添加到模型编辑器 *** 注意创建模型时 矩阵必须为本地矩阵, 否则移动方向会是跟随球心矩阵 ***
   * @param model{Cesium.Model}
   */
  add(model) {
    // this.destroy()
    this.model = model;
    this.position = Matrix4.getTranslation(model.modelMatrix, new Cartesian3());
    this.primitives = new PrimitiveCollection();
    this.viewer.scene.primitives.add(this.primitives);

    // 创建平移轴
    this._createRod();
    // 旋转平移轴
    this._rotationRod();
    // 添加平移轴
    this._addRod();
    // 创建旋转轴
    this._createSphereAxis();
    // 旋转旋转轴
    this._rotationSphereAxis();
    // 添加旋转轴
    this._addSphereAxis();
    // // 添加辅助球
    this._addAuxiliaryBall(
      this.model.boundingSphere.radius * 2,
      Color.RED.withAlpha(0.2)
    );

    // 添加监听器
    this._addListener();
  }

  // 添加监听器
  _addListener() {
    this.handler.setInputAction(
      this._clickListener,
      ScreenSpaceEventType.LEFT_DOWN
    );
    this.handler.setInputAction(
      this._clickUpListener,
      ScreenSpaceEventType.LEFT_UP
    );
    this.handler.setInputAction(
      this._moveListener,
      ScreenSpaceEventType.MOUSE_MOVE
    );
  }

  // 清除操纵杆, 监听器
  destroy() {
    if (!this.primitives || this.primitives.isDestroyed()) return;
    this.primitives.removeAll();
    this.viewer.scene.primitives.removePrimitives(this.primitives);
    this._removeListener();
  }

  // 移除监听器
  _removeListener() {
    this.handler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
    this.handler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
    this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
  }

  // 创建操作杆
  _createRod() {
    const boundingShpere = this.model.boundingSphere;
    const radius = boundingShpere.radius;
    const options = {
      width: radius / 15,
      headWidth: radius / 6,
      length: radius * 5, //坐标轴的长度应该视模型的直径而定
      headLength: radius / 3,
      position: this.position
    };

    // 向上的向量
    const vectorNormalUp = new Cartesian3();
    const vZ = new Cartesian3(0, 0, 1);
    Cartesian3.normalize(this.position.clone(), vectorNormalUp);

    // 向右的向量
    const vectorNormalRight = new Cartesian3();

    // 由z轴向上 地表向上两个向量叉乘, 则可以得出, 向右的向量
    Cartesian3.cross(vZ, vectorNormalUp, vectorNormalRight);

    Cartesian3.normalize(vectorNormalRight, vectorNormalRight);

    // 向前的向量
    const vectorNormalFront = new Cartesian3();
    Cartesian3.cross(vectorNormalRight, vectorNormalUp, vectorNormalFront);
    Cartesian3.multiplyByScalar(vectorNormalFront, -1, vectorNormalFront);
    Cartesian3.normalize(vectorNormalFront, vectorNormalFront);
    this.axisX = new ArrowPolyline({
      id: "axisX",
      color: Color.GREEN,
      direction: vectorNormalRight,
      unit: Cartesian3.UNIT_X,
      ...options
    });
    this.axisZ = new ArrowPolyline({
      id: "axisZ",
      color: Color.RED,
      direction: vectorNormalUp,
      unit: Cartesian3.UNIT_Z,
      ...options
    });
    this.axisY = new ArrowPolyline({
      id: "axisY",
      color: Color.BLUE,
      direction: vectorNormalFront,
      unit: Cartesian3.UNIT_Y,
      ...options
    });
  }

  // 添加操作杆
  _addRod() {
    this.primitives.add(this.axisZ.primitive);
    this.primitives.add(this.axisX.primitive);
    this.primitives.add(this.axisY.primitive);
  }

  // 初始化操作杆
  _rotationRod() {
    const mx = Matrix3.fromRotationY(CesiumMath.toRadians(90));
    const rotationX = Matrix4.fromRotationTranslation(mx);
    this.axisX.rotation(rotationX);
    const my = Matrix3.fromRotationX(CesiumMath.toRadians(90));
    const rotationY = Matrix4.fromRotationTranslation(my);
    this.axisY.rotation(rotationY);
  }

  // 点击监听
  _clickListener = () => {
    if (this.translationAxisIsSelected() || this.rotationAxisIsSelected()) {
      this.viewer.scene.screenSpaceCameraController.enableRotate = false;
      this.left_press = true;
    }
  };

  /**
   * 平移轴被选中
   * @return {boolean}
   */
  translationAxisIsSelected() {
    return this.axisX.selected || this.axisY.selected || this.axisZ.selected;
  }

  /**
   * 旋转轴被选中
   * @return {boolean}
   */
  rotationAxisIsSelected() {
    return (
      this.axisSphereZ.selected ||
      this.axisSphereX.selected ||
      this.axisSphereY.selected
    );
  }

  _clickUpListener = () => {
    this.axis = null;
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.auxiliaryBall.show = false;
    this.left_press = false;
  };

  // 移动监听
  _moveListener = e => {
    const pick = this.viewer.scene.pick(e.endPosition);
    // 如果鼠标左键没有按下
    if (!this.left_press) {
      this._resetMaterial();
    } else if (this.axis && this.left_press) {
      if (this.translationAxisIsSelected()) {
        this._precessTranslation(e, this.axis);
      } else if (
        this.rotationAxisIsSelected() ||
        (pick && pick.id === "auxiliaryBall") ||
        this.axis.is(pick.id)
      ) {
        this._precessRotation(e, this.axis);
      }
      return;
    }
    if (pick && pick.id) {
      this._resetMaterial();
      let axis = null;
      if (this.axisX.is(pick.id)) {
        axis = this.axisX;
      } else if (this.axisY.is(pick.id)) {
        axis = this.axisY;
      } else if (this.axisZ.is(pick.id)) {
        axis = this.axisZ;
      } else if (this.axisSphereX.is(pick.id)) {
        axis = this.axisSphereX;
      } else if (this.axisSphereY.is(pick.id)) {
        axis = this.axisSphereY;
      } else if (this.axisSphereZ.is(pick.id)) {
        axis = this.axisSphereZ;
      }
      if (axis) {
        this.axis = axis;
        this.axis.select();
        if (this.rotationAxisIsSelected()) {
          this.auxiliaryBall.show = true;
        }
      }
    }
  };

  /**
   * 处理平移
   * @param e
   * @param axis{AxisSphere}
   * @private
   */
  _precessRotation(e, axis) {
    debugger;
    this.auxiliaryBall.show = true;

    // 通过射线, 获取在平面上的位置
    this.viewer.camera.getPickRay(e.startPosition, this.pickRay);
    const vtStart = this.getPlaneRotationPosition(
      this.position,
      this.viewer.camera.position.clone(),
      this.pickRay,
      axis.direction
    );
    this.viewer.camera.getPickRay(e.endPosition, this.pickRay);
    const vtEnd = this.getPlaneRotationPosition(
      this.position,
      this.viewer.camera.position.clone(),
      this.pickRay,
      axis.direction
    );

    // 利用叉乘性质判断方向
    const cartesian = Cartesian3.cross(vtStart, vtEnd, new Cartesian3());
    console.log(cartesian);
    console.log(axis.direction);
    const angle = CesiumMath.toDegrees(
      Cartesian3.angleBetween(cartesian, axis.direction)
    );
    let rotateAngleInRadians = Cartesian3.angleBetween(vtEnd, vtStart);
    if (angle > 1) {
      rotateAngleInRadians = -rotateAngleInRadians;
    }

    let mx = null;
    let my = null;
    let mz = null;
    if (axis.id === "axisSphereX") {
      mx = Matrix3.fromRotationZ(rotateAngleInRadians);
      my = Matrix3.fromRotationX(rotateAngleInRadians);
      // my = Cesium.Matrix3.fromRotationX(rotateAngleInRadians)
      mz = Matrix3.fromRotationX(rotateAngleInRadians);
    } else if (axis.id === "axisSphereY") {
      this.hasYRotate = true;
      mx = Matrix3.fromRotationY(rotateAngleInRadians);
      my = Matrix3.fromRotationZ(-rotateAngleInRadians); //负的
      mz = Matrix3.fromRotationY(rotateAngleInRadians);
    } else if (axis.id === "axisSphereZ") {
      mx = Matrix3.fromRotationX(-rotateAngleInRadians);
      my = Matrix3.fromRotationY(rotateAngleInRadians);
      mz = Matrix3.fromRotationZ(rotateAngleInRadians);
    }
    const rotationX = Matrix4.fromRotationTranslation(mx);
    const rotationY = Matrix4.fromRotationTranslation(my);
    const rotationZ = Matrix4.fromRotationTranslation(mz);
    this.rotation(rotationX, rotationY, rotationZ, axis, rotateAngleInRadians);
  }

  /**
   * 旋转
   * @param rotationX{Cesium.Matrix4} 旋轉角度
   * @param axis{AxisSphere}
   * @param rotateAngleInRadians
   */
  rotation(rotationX, rotationY, rotationZ, axis, rotateAngleInRadians) {
    this.axisSphereX.rotationAxis(rotationX);
    this.axisSphereY.rotationAxis(rotationY);
    this.axisSphereZ.rotationAxis(rotationZ);

    this.axisX.rotationAxis(rotationX);
    this.axisY.rotationAxis(rotationY);
    this.axisZ.rotationAxis(rotationZ);
    this._rotateVectorByAxisForAngle(
      this.axisX.direction,
      axis.direction,
      rotateAngleInRadians
    );
    this._rotateVectorByAxisForAngle(
      this.axisY.direction,
      axis.direction,
      rotateAngleInRadians
    );
    this._rotateVectorByAxisForAngle(
      this.axisZ.direction,
      axis.direction,
      rotateAngleInRadians
    );
    Matrix4.multiply(this.model.modelMatrix, rotationZ, this.model.modelMatrix);
    Matrix4.multiply(
      this.auxiliaryBall.modelMatrix,
      rotationZ,
      this.auxiliaryBall.modelMatrix
    );
    // const number = Cesium.Math.toDegrees(rotateAngleInRadians)
    // axis.updateAngle(number)
  }

  /**
   * 处理选中
   * @param e{{message: {startPosition: Cesium.Cartesian2, endPosition: Cesium.Cartesian2}}}
   * @param axis{ArrowPolyline}
   * @private
   */
  _precessTranslation(e, axis) {
    this.auxiliaryBall.show = false;

    // 基于射线, 获取平面上的位置
    this.viewer.camera.getPickRay(e.startPosition, this.pickRay);
    const startPosition = this.getPlanePosition(
      this.position,
      this.viewer.camera.position.clone(),
      this.pickRay,
      axis.direction
    );
    this.viewer.camera.getPickRay(e.endPosition, this.pickRay);
    const endPosition = this.getPlanePosition(
      this.position,
      this.viewer.camera.position.clone(),
      this.pickRay,
      axis.direction
    );

    // 获取移动长度, 并对该轴点乘, 获取在该轴实际移动的距离
    const moveVector = new Cartesian3();
    Cartesian3.subtract(endPosition, startPosition, moveVector);
    const moveLength = Cartesian3.dot(axis.direction, moveVector);
    this.translation(moveVector, axis.unit, moveLength);
  }

  /**
   * 平移
   * @param moveVector
   * @param unit
   * @param moveLength
   */
  translation(moveVector, unit, moveLength) {
    //由于X、Y移动轴旋转过，所以坐标轴方向发生了改变，例如本地坐标的x轴是X移动轴的y轴方向，所以他们移动的轴需要修改
    let mX = Matrix3.fromRotationY(CesiumMath.toRadians(-90.0));
    let mY = Matrix3.fromRotationX(CesiumMath.toRadians(-90.0));
    this.axisX.translation(
      moveVector,
      Matrix3.multiplyByVector(mX, unit, new Cartesian3()),
      moveLength
    );
    this.axisY.translation(
      moveVector,
      Matrix3.multiplyByVector(mY, unit, new Cartesian3()),
      moveLength
    );

    // this.axisX.translation(moveVector, unit, moveLength)
    // this.axisY.translation(moveVector, unit, moveLength)
    this.axisZ.translation(moveVector, unit, moveLength);
    this.axisSphereX.translation(
      moveVector,
      Matrix3.multiplyByVector(mX, unit, new Cartesian3()),
      moveLength
    );
    this.axisSphereY.translation(
      moveVector,
      Matrix3.multiplyByVector(mY, unit, new Cartesian3()),
      moveLength
    );
    // this.axisSphereX.translation(moveVector, unit, moveLength)
    // this.axisSphereY.translation(moveVector, unit, moveLength)
    this.axisSphereZ.translation(moveVector, unit, moveLength);

    // 更新模型位置
    Matrix4.multiplyByTranslation(
      this.model.modelMatrix,
      Cartesian3.multiplyByScalar(unit, moveLength, new Cartesian3()),
      this.model.modelMatrix
    );
    // Cesium.Matrix4.getTranslation(this.model.modelMatrix, this.position)

    // 辅助球的坐标系为球心坐标, 需要获取本地矩阵移动距离, 修改辅助球位置
    Matrix4.multiplyByTranslation(
      this.auxiliaryBall.modelMatrix,
      Cartesian3.multiplyByScalar(unit, moveLength, new Cartesian3()),
      this.auxiliaryBall.modelMatrix
    );
  }

  // 复位所有的材质
  _resetMaterial() {
    this.axisX.rest();
    this.axisY.rest();
    this.axisZ.rest();
    this.axisSphereY.rest();
    this.axisSphereZ.rest();
    this.axisSphereX.rest();
    this.auxiliaryBall.show = false;
  }

  // 创建 旋转轴
  _createSphereAxis() {
    const radius = this.model.boundingSphere.radius * 2;
    this.axisSphereZ = new AxisSphere(
      "axisSphereZ",
      radius,
      this.position,
      Color.RED
    );
    this.axisSphereX = new AxisSphere(
      "axisSphereX",
      radius,
      this.position,
      Color.GREEN
    );
    this.axisSphereY = new AxisSphere(
      "axisSphereY",
      radius,
      this.position,
      Color.BLUE
    );
    this.axisSphereZ.direction = this.axisZ.direction;
    this.axisSphereX.direction = this.axisX.direction;
    this.axisSphereY.direction = this.axisY.direction;
  }

  // 旋转 旋转轴
  _rotationSphereAxis() {
    const mx = Matrix3.fromRotationY(CesiumMath.toRadians(90));
    const rotationX = Matrix4.fromRotationTranslation(mx);
    this.axisSphereX.rotation(rotationX);
    const my = Matrix3.fromRotationX(CesiumMath.toRadians(90));
    const rotationY = Matrix4.fromRotationTranslation(my);
    this.axisSphereY.rotation(rotationY);
  }

  // 添加旋转轴
  _addSphereAxis() {
    this.primitives.add(this.axisSphereZ.primitive);
    this.primitives.add(this.axisSphereY.primitive);
    this.primitives.add(this.axisSphereX.primitive);
  }

  /**
   * 添加辅助球  *** 选中时高亮 ***
   * @param {number} radius
   * @param {Cesium.Color} color
   */
  _addAuxiliaryBall(radius, color) {
    const cartesian3 = this.extended(this.position, -radius);
    const modelMatrix = Matrix4.multiplyByTranslation(
      Transforms.eastNorthUpToFixedFrame(cartesian3),
      new Cartesian3(0.0, 0.0, radius),
      new Matrix4()
    );

    const sphereGeometry = new SphereGeometry({
      vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      radius: radius
    });
    const sphereInstance = new GeometryInstance({
      id: "auxiliaryBall",
      geometry: sphereGeometry,
      modelMatrix: modelMatrix,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(color)
      }
    });

    this.auxiliaryBall = this.primitives.add(
      new Primitive({
        geometryInstances: sphereInstance,
        appearance: new PerInstanceColorAppearance({
          translucent: true,
          closed: true
        })
      })
    );
    this.auxiliaryBall.show = false;
  }

  /**
   * 通过轴旋转角度
   * @param vector
   * @param axis
   * @param angle
   */
  _rotateVectorByAxisForAngle(vector, axis, angle) {
    const rotateQuaternion = this.normalizingQuaternion(
      Quaternion.fromAxisAngle(axis, angle, new Quaternion())
    );
    const quaternion = this.cartesian3ToQuaternion(vector);
    Quaternion.multiply(
      Quaternion.multiply(rotateQuaternion, quaternion, quaternion),
      Quaternion.inverse(rotateQuaternion, new Quaternion()),
      quaternion
    );
    vector.x = quaternion.x;
    vector.y = quaternion.y;
    vector.z = quaternion.z;
    return quaternion;
  }

  /**
   * 获取平面上的位置
   * @param position{Cesium.Cartesian3} 模型位置
   * @param cameraPosition{Cesium.Cartesian3} 相机位置
   * @param pickRay{Cesium.Ray} 从相机到屏幕的射线
   * @param axisDirection{Cesium.Cartesian3} 轴的向量
   */
  getPlanePosition(position, cameraPosition, pickRay, axisDirection) {
    // 第一步, 获取相机在轴上的投影
    const cartesian3 = Cartesian3.subtract(
      cameraPosition,
      position,
      new Cartesian3()
    ); //c1 相机位置到模型位置向量
    const length = Cartesian3.dot(cartesian3, axisDirection); //点乘 向量到本地坐标轴的投影长度
    // 获取轴上投影的位置, 以相机到这个位置, 为平面法线
    Cartesian3.multiplyByScalar(axisDirection, length, cartesian3); //c2 向量：方向：坐标轴、长度：相机位置到模型位置在轴上的投影长度
    Cartesian3.add(position, cartesian3, cartesian3); //c3 模型位置 加 相机位置到模型位置在轴上的投影长度本地坐标轴方向向量
    const pn = Cartesian3.subtract(
      cameraPosition,
      cartesian3,
      new Cartesian3()
    ); //相机位置与
    // 获取单位向量, 射线向投影向量投影
    Cartesian3.normalize(pn, cartesian3); //c4
    const number = Cartesian3.dot(pickRay.direction, cartesian3);
    // 获取射线与平面相交点
    const number1 = Cartesian3.magnitude(pn);
    Cartesian3.multiplyByScalar(
      pickRay.direction,
      -number1 / number,
      cartesian3
    ); //c5
    return cartesian3;
  }

  /**
   * 获取平面上的位置
   * @param position{Cesium.Cartesian3} 模型位置
   * @param cameraPosition{Cesium.Cartesian3} 相机位置
   * @param pickRay{Cesium.Ray} 从相机到屏幕的射线
   * @param axisDirection{Cesium.Cartesian3} 轴的向量
   */
  getPlaneRotationPosition(position, cameraPosition, pickRay, axisDirection) {
    const cartesian3 = Cartesian3.subtract(
      cameraPosition,
      position,
      new Cartesian3()
    ); //c1
    const length = Cartesian3.dot(cartesian3, axisDirection);
    const number = Cartesian3.dot(pickRay.direction, axisDirection);
    Cartesian3.multiplyByScalar(
      pickRay.direction,
      -length / number,
      cartesian3
    ); //c2
    Cartesian3.add(cameraPosition, cartesian3, cartesian3);
    return Cartesian3.subtract(cartesian3, position, new Cartesian3());
  }
  //数学函数
  moduloQuaternion = quaternion => {
    // N(q) = |q| = x*x + y*y + z*z + w*w
    return (
      quaternion.x * quaternion.x +
      quaternion.y * quaternion.y +
      quaternion.z * quaternion.z +
      quaternion.w * quaternion.w
    );
  };

  cartesian3ToQuaternion = cartesian3 => {
    return new Quaternion(cartesian3.x, cartesian3.y, cartesian3.z, 0);
  };

  normalizingQuaternion = quaternion => {
    // Normalize( q ) = q/ |q| = q / (x*x + y*y + z*z + w*w)
    return Quaternion.divideByScalar(
      quaternion,
      this.moduloQuaternion(quaternion),
      quaternion
    );
  };
  extended(cartesian, length) {
    const result = new Cartesian3();
    Cartesian3.normalize(cartesian, result);
    Cartesian3.add(
      cartesian,
      Cartesian3.multiplyByScalar(result, length, result),
      result
    );
    return result;
  }
}
