import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"


class PatternShield {

    mesh
     /**
     * GradieCircle构造函数
     *
     * @param {Object} options 半球样式
     * @param {Vector3} options.center 半球位置
     * @param {Number} options.radius 半球半径
     * @param {Color} options.color 半球颜色
     */
    constructor(options) {
        let radius = options && options.radius || 5
        let position = options && options.center || new THREE.Vector3(0,0,0)
        let material = this.createMaterial(options)
        this.material = material
        const geometry = new THREE.SphereGeometry(radius, 32, 32, 0, 2*Math.PI, 0, Math.PI/2)
        let mesh = new THREE.Mesh(geometry,material)
        mesh.rotation.x = Math.PI / 2
        mesh.position.copy(position)
        // mesh.position.set(0,0,this.depth)
        this.mesh = mesh
        const tween = new TWEEN.Tween(material.uniforms.offset)
            .to({value: 1}, 2000)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .repeat(Infinity)
            .start()
        console.log(material)
        this.animate(material)
    }
    get mesh() {
        return this.mesh
    }
    createMaterial(options) {
        let color = (options && options.color) || new THREE.Color('rgb(85,187,237)')
        let vertex = `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main()
            {
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `
        let fragment = `
            #ifdef GL_ES
            precision mediump float;
            #endif

            uniform float b;
            uniform float p;
            uniform float s;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;

            uniform float time;
            uniform float offset;
            uniform vec3 glowColor;
            uniform sampler2D backgroundTexture;

            varying vec2 vUv;

            void main() {
                // 使用 vUv 替代 gl_FragCoord, 否则会以摄像机的角度绘制平面纹理
                vec2 pos = vUv;

                
                
                float t = time;
                float val = 0.0;
                float scale1 = 40.0;
                float scale2 = 20.0;
                const float PI = 3.14159265;

                val += sin((pos.x*scale1 + t));
                val += sin((pos.y*scale1 + t)/2.0);
                val += sin((pos.x*scale2 + pos.y*scale2 + sin(t))/2.0);
                val += sin((pos.x*scale2 - pos.y*scale2 + t)/2.0);
                // val += sin((pos.x*scale2 - pos.y*scale2 + t)/2.0);
                // val += sin((pos.y*scale2 - pos.x*scale2 + t)/2.0);

                val = (cos(PI*val) + 1.0) * 0.5;

                float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
                a = clamp(a, 0.2, 0.9);

                // offset随着时间在0 - 1之间不断变化
                // 带入到获取alpha贴图的参数中做到贴图不断从上到下扫过
                vec4 background = texture2D(backgroundTexture, vec2(vUv.x, vUv.y + offset));
                background.a = clamp(background.a, 0.3, 0.9); // 因为最后与结果相乘，0.3控制整个光照的最低亮度，0.9控制最高亮度，如果开启辉光需要适当降低最低亮度
                float opacity = max(a, val) * background.a;
                // float opacity = max(0.5, val) * background.a;
                gl_FragColor = vec4(glowColor, opacity);

            }
        `
        let texture = new THREE.TextureLoader().load(
            '/images/gradient.png'
        )
        const material = new THREE.ShaderMaterial({
            uniforms: {
                backgroundTexture: {          // 用于实现扫描效果的贴图
                    type: 't', 
                    value: texture 
                },
                offset: {
                    type: 'f',
                    value: 0.0  // 扫描的偏移量
                },
                time: {
                    value: 0.0  // 噪声随时间变化
                },                 
                glowColor: {
                    type: 'v3',
                    value: color
                },
                s: { type: "f", value: -1.0},//scale
                b: { type: "f", value: 1},//bias
                p: { type: "f", value: 1.0 },//power
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide,
            depthWrite: false,
            transparent: true,
        })
        return material
    }
    addTo(scene) {
        scene.add(this.mesh)
    }
    animate() {
        this.material.uniforms.time.value += 0.01
        this.start = requestAnimationFrame(this.animate.bind(this))
        TWEEN.update()

    }
    stop() {
        if(this.start) {
            cancelAnimationFrame(this.start)
        }
        
    }
}

export default PatternShield