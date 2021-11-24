class CanvasFlowline {
  constructor(params) {
    if (!params) {
      throw Error("Creating SpreadRing instance must provide parameters");
    }

    this.startx = params.route[0].x; //设置起始点坐标
    this.starty = params.route[0].y;
    this.route = params.route; //轨迹点，数组格式
    this.speed = params.speed; //速度
    this.width = params.width; //线的宽度
    this.colorGradient = params.colorGradient; //飞线颜色及渐变比例
    this.length = params.length; //飞线的总体长度
    this.step = params.step || 0; //表示以第几个轨迹点作为起始点绘制飞线动画，默认是第一个
    this.repeat = typeof params.repeat !== "undefined" ? params.repeat : true;
    this.drawTimes = 0;
  }
  draw(ctx) {
    this.drawTimes++; //帧数自增
    ctx.beginPath();
    let { route, startx, starty, colorGradient, speed } = this;
    ctx.moveTo(this.startx, this.starty); //首先要绘制起始点的位置

    let length =
      this.drawTimes * speed <= this.length
        ? this.drawTimes * speed
        : this.length; //计算每一帧需要绘制的长度

    let endx = startx;
    let endy = starty;

    for (let i = this.step + 1, len = route.length; i <= len; i++) {
      let next_x; //获取第二个轨迹点的坐标
      let next_y;

      if (i === len) {
        if (!this.repeat) break;
        next_x = route[0].x;
        next_y = route[0].y;
      } else {
        next_x = route[i].x;
        next_y = route[i].y;
      }

      let tempLength = Math.sqrt(
        Math.pow(next_x - startx, 2) + Math.pow(next_y - starty, 2)
      ); //这一步是关键，主要是计算当前起始点到下一个轨迹点的直线长度，计算方法就是勾股定理

      if (tempLength > length) {
        // 当上述长度大于这一帧的线长时，说明飞线在这一帧还未运动至下一个轨迹点，因此这一帧飞线为直线的状态，不存在拐角
        let dx = (length * (next_x - startx)) / tempLength; //按照线段比例计算出x的增量
        let dy = (length * (next_y - starty)) / tempLength;

        endx = startx + dx; //得出这一帧的终点坐标
        endy = starty + dy;

        ctx.lineTo(endx, endy); //连线完成这一帧的飞线，并退出循环
        break;
      } else {
        // 如果存在拐角，则飞线必定经过下一个轨迹点
        ctx.lineTo(next_x, next_y); //连接下一个轨迹点
        startx = next_x; //将下一个轨迹点的坐标设置为起始坐标
        starty = next_y;

        endx = next_x;
        endy = next_y;

        length = length - tempLength; //计算剩余未绘制的飞线长度，开始下一轮的计算
      }
    }
    let lg = ctx.createLinearGradient(this.startx, this.starty, endx, endy);
    Object.keys(colorGradient).forEach(key => {
      lg.addColorStop(key, `rgba(${colorGradient[key]})`);
    });
    ctx.strokeStyle = lg;
    ctx.lineWidth = this.width;
    ctx.stroke();
  }
  next() {
    let _this = this; //在绘制下一帧飞线前，线获取当前帧的状态
    let endStep = this.step; //获取起始轨迹点的index，默认为轨迹数组的第一个点
    // let { route, startx, starty } = this;
    let { route } = this;
    let length = this.speed; //与上一个方法不同，这个方法中length的值表示每一帧运动的长度，及一个speed的长度
    for (let i = endStep + 1, len = route.length; i < len; i++) {
      let next_x = route[i].x; //获取下一个轨迹点的坐标
      let next_y = route[i].y;

      let tempLength = Math.sqrt(
        Math.pow(next_x - _this.startx, 2) +
          Math.pow(route[i].y - _this.starty, 2)
      ); //与上一个方法相同，通过一个勾股定理计算每一帧的运动是否经过一个拐点

      let dx = (length * (next_x - _this.startx)) / tempLength;
      let dy = (length * (next_y - _this.starty)) / tempLength;

      if (tempLength > length) {
        //如果下一帧运动完后，起始点不经过拐点，则计算下一帧的起始点并赋值，结束循环
        this.startx += dx;
        this.starty += dy;
        break;
      } else {
        // 如果经过拐点，则将起始点设置为拐点的坐标，并做下一轮的循环
        _this.startx = next_x;
        _this.starty = next_y;
        _this.step++;

        length = length - tempLength; //计算剩余的长度
      }

      if (this.step >= route.length - 1) {
        // 如果已经运行到最后一个轨迹点，则表示一次飞线动画完成
        if (this.repeat) {
          this.step = -1;
        }
      }
    }
  }
}
export default CanvasFlowline;
