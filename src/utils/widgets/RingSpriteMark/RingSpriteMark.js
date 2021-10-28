import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import CanvasFlowline from "../CanvasFlowline/CanvasFlowline.js";
import GradientRing from "../GradientRing/GradientRing.js";
import SpreadRing from "../SpreadRing/SpreadRing.js";

class RingSpriteMark {
  constructor(params) {
    const text = params.text || "Label";
    const height = params.size || 6;

    const spriteLabel = this.createLabel({
      text: text,
      height: height * 0.568,
      y: height
    });
    spriteLabel.visible = false;
    this.spriteLabel = spriteLabel;
    const pole = this.createPole({
      height: height,
      color: 0xffffff,
      y: height * 0.5
    });
    const bottomShpere = this.createBottomShpere({
      radius: height * 0.1,
      color: 0x319fb0,
      y: 0
    });
    const bottomCircle = this.createBottomCircle({
      radius: height / 6,
      color: 0x3ed5eb,
      y: 0.1
    });
    const bottomGradientRing1 = new GradientRing({
      innerRadius: height * 0.233,
      outerRadius: height * 0.267,
      thetaLength: 280,
      openEnd: false,
      opacity: 0.9,
      direction: true
    });
    bottomGradientRing1.mesh.rotation.x = -Math.PI / 2;

    const bottomGradientRing2 = new GradientRing({
      innerRadius: height * 0.283,
      outerRadius: height * 0.383,
      thetaLength: 250,
      openEnd: true,
      opacity: 0.6,
      direction: false
    });
    bottomGradientRing2.mesh.rotation.x = -Math.PI / 2;

    const bottomSpreadRing = new SpreadRing({
      radius0: height * 0.833,
      radius: 0.04,
      width: 0.2
    });
    bottomSpreadRing.mesh.rotation.x = -Math.PI / 2;
    bottomSpreadRing.mesh.position.y = -0.05;

    const group = new THREE.Group();
    group.add(
      spriteLabel,
      pole,
      bottomShpere,
      bottomCircle,
      bottomGradientRing1.mesh,
      bottomGradientRing2.mesh,
      bottomSpreadRing.mesh
    );
    // group.add(spriteLabel, pole, bottomShpere, bottomCircle, bottomGradientRing1.mesh, bottomGradientRing2.mesh)
    this.mesh = group;

    this.animate();
  }
  createLabel(options) {
    this.text = options.text;
    const height = options.height;
    const canvas = document.createElement("canvas");
    const drawOptions = {
      canvas: canvas,
      lineLength: 50,
      lineWidth: 14,
      hGap: 40,
      vGap: 100,
      fontSize: 68
    };
    canvas.height = 150;
    const characterC = this.text.match(/[\u4e00-\u9fa5]/g);
    const cLength = characterC ? characterC.length : 0;
    const characterEc = this.text.match(/[A-Z]/g);
    const eCLength = characterEc ? characterEc.length : 0;
    const characterEl = this.text.match(/[a-z_]/g);
    const eLLength = characterEl ? characterEl.length : 0;
    const characterN = this.text.match(/\d/g);
    const nLength = characterN ? characterN.length : 0;

    canvas.width =
      drawOptions.hGap * 2 +
      drawOptions.fontSize *
        (cLength + eCLength / 1.15 + eLLength / 1.5 + nLength / 1.7);

    this.drawOptions = drawOptions;
    const lineWidth = drawOptions.lineWidth;

    const ctx = canvas.getContext("2d");
    this.ctx = ctx;

    const flowLineRoute = [
      { x: lineWidth, y: lineWidth },
      { x: canvas.width - lineWidth, y: lineWidth },
      { x: canvas.width - lineWidth, y: canvas.height - lineWidth },
      { x: lineWidth, y: canvas.height - lineWidth }
    ];
    const flowLineOptions = {
      colorGradient: {
        0: "255,255,255,0.1",
        0.5: "255,255,255,0.8",
        1: "255,255,255,0.1"
      },
      length: canvas.width / 2,
      width: 14,
      speed: 8,
      route: flowLineRoute,
      step: 0
    };
    const canvasFlowline = new CanvasFlowline(flowLineOptions);
    this.canvasFlowline = canvasFlowline;

    const texture = new THREE.CanvasTexture(canvas);
    this.labelTexture = texture;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set((height * canvas.width) / canvas.height, height);
    sprite.center.set(0, 0);
    sprite.position.y = options.y;

    return sprite;
  }
  drawLabelCanvas(ctx, options, text) {
    const canvas = options.canvas;
    const lineLength = options.lineLength;
    const lineWidth = options.lineWidth;
    const hGap = options.hGap;
    const vGap = options.vGap;
    const fontSize = options.fontSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#F8EB00";
    ctx.beginPath();
    ctx.moveTo(0, lineLength);
    ctx.lineTo(0, 0);
    ctx.lineTo(lineLength, 0);
    ctx.moveTo(canvas.width - lineLength, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, lineLength);
    ctx.moveTo(canvas.width, canvas.height - lineLength);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width - lineLength, canvas.height);
    ctx.moveTo(lineLength, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - lineLength);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fillStyle = "rgba(0.5,0.5,0.5,0.5)";
    ctx.fillRect(
      lineWidth,
      lineWidth,
      canvas.width - lineWidth * 2,
      canvas.height - lineWidth * 2
    );
    ctx.font = fontSize + "px bold 微软雅黑";
    ctx.fillStyle = "#F8EB00";
    ctx.fillText(text, hGap, vGap);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(lineWidth, canvas.height - lineWidth);
    ctx.lineTo(lineWidth + 30, canvas.height - lineWidth);
    ctx.lineTo(lineWidth, canvas.height - lineWidth - 30);
    ctx.closePath();
    ctx.fill();
  }
  createPole(options) {
    const height = options.height;
    const radius = height / 60;
    const poleGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const poleMaterial = new THREE.MeshBasicMaterial({
      color: options.color,
      transparent: true,
      opacity: 0.5
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = options.y;
    pole.renderOrder = 1;
    pole.visible = false;
    const tween = new TWEEN.Tween({ scale: 0 });
    tween
      .to({ scale: 1 }, 1000)
      .onUpdate(({ scale }) => {
        pole.scale.set(1, scale, 1);
        pole.position.y = (height / 2) * scale;
      })
      .onStart(() => {
        pole.visible = true;
      })
      .start()
      .onComplete(() => {
        let times = 0;
        const interval = setInterval(() => {
          if (this.spriteLabel.visible) {
            this.spriteLabel.visible = false;
          } else {
            this.spriteLabel.visible = true;
          }
          times++;
          if (times === 3) {
            clearInterval(interval);
          }
        }, 200);
      });

    return pole;
  }
  createBottomShpere(options) {
    const shpereGeometry = new THREE.SphereGeometry(
      options.radius,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const shpereMaterial = new THREE.MeshLambertMaterial({
      color: options.color,
      transparent: true,
      opacity: 0.5
    });
    const bottomShpere = new THREE.Mesh(shpereGeometry, shpereMaterial);
    bottomShpere.position.y = options.y;
    bottomShpere.renderOrder = 2;

    return bottomShpere;
  }
  createBottomCircle(options) {
    const circleGeometry = new THREE.CircleGeometry(options.radius, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: options.color,
      transparent: true,
      opacity: 0.5
    });
    const bottomCircle = new THREE.Mesh(circleGeometry, circleMaterial);
    bottomCircle.rotation.x = -Math.PI / 2;
    bottomCircle.position.y = options.y;
    bottomCircle.renderOrder = 3;

    return bottomCircle;
  }
  animate() {
    //文字Label的Canvas纹理内容绘制
    this.drawLabelCanvas(this.ctx, this.drawOptions, this.text);
    this.canvasFlowline.draw(this.ctx);
    this.canvasFlowline.next();
    this.labelTexture.needsUpdate = true;
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  stop() {
    cancelAnimationFrame(this.start);
  }
  destory() {
    this.stop();
    this.labelTexture.dispose();
    this.mesh.traverse(item => {
      if (item.isMesh || item instanceof THREE.Sprite) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
          });
        } else {
          item.material.dispose();
        }
      }
    });
  }
}

export default RingSpriteMark;
