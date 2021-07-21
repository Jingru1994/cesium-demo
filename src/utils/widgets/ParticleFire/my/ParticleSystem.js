import { thresholdScott } from 'd3'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shader.js'
import LinearSpline from './LinerSpline.js'

class ParticleSystem {
    constructor(params) {
        this.PARTICLE_LIFE = 5.0
        const uniforms = {
            diffuseTexture: {
                value: new THREE.TextureLoader().load('images/fire3.png')
            },
            pointMultiplier: {
                value: window.innerHeight/ (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        }

        this._material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true

        })

        this._camera = params.camera
        this._particles = []

        this._geometry = new THREE.BufferGeometry()
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([],3))

        this._points = new THREE.Points(this._geometry, this._material)

        params.parent.add(this._points)

        this._alphaSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a)
        })
        this._alphaSpline.AddPoint(0.0, 0.0)
        this._alphaSpline.AddPoint(0.1, 1.0)
        this._alphaSpline.AddPoint(0.6, 1.0)
        this._alphaSpline.AddPoint(1.0, 0.0)

        this._colourSpline = new LinearSpline((t, a, b) => {
            const c = a.clone()
            return c.lerp(b, t)
        })
        this._colourSpline.AddPoint(0.0, new THREE.Color(0xffff80))
        this._colourSpline.AddPoint(1.0, new THREE.Color(0xff8080))

        this._sizeSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a)
        })
        this._sizeSpline.AddPoint(0.0, 1.5)
        this._sizeSpline.AddPoint(0.5, 5.0)
        this._sizeSpline.AddPoint(1.0, 1.0)


        this._AddParticles()
        this._UpadteGeometry()
    }
    _AddParticles(timeElapsed) {
        if (!this.gdfsghk) {
            this.gdfsghk = 0.0;
        }
        this.gdfsghk += timeElapsed;
        const n = Math.floor(this.gdfsghk * 75.0);
        this.gdfsghk -= n / 75.0;

        for (let i = 0; i < 5; i++) {
            const life = 2;
            this._particles.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 1) * 1.0,
                    (Math.random() * 2 - 1) * 1.0,
                    (Math.random() * 2 - 1) * 1.0
                ),
                size: (Math.random() * 0.5 + 0.5) * 4.0,
                colour: new THREE.Color(1,1,1),
                alpha: 1.0,
                life: life,
                maxlife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                velocity: new THREE.Vector3(0, 15, 0)
            })
        }

    }
    _UpadteGeometry() {
        const positions = []
        const sizes = []
        const colours = []
        const angles = []
    
        for(let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z)
            sizes.push(p.currentSize)
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
            angles.push(p.rotation)
        }
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this._geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
        this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
        this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))
        this._geometry.attributes.position.needsUpdate = true
        this._geometry.attributes.size.needsUpdate = true
        this._geometry.attributes.colour.needsUpdate = true
        this._geometry.attributes.angle.needsUpdate = true
    }
    _UpdateParticles(timeElapsed) {
        for(let p of this._particles) {
            p.life -= timeElapsed
        }
        this._particles = this._particles.filter(p => {
            return p.life > 0.0
        })

        for(let p of this._particles) {
            const t = 1.0 - p.life / p.maxlife

            p.rotation += timeElapsed * 0.5
            p.currentSize = p.size * this._sizeSpline.Get(t)
            p.alpha = this._alphaSpline.Get(t)
            p.colour.copy(this._colourSpline.Get(t))

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))

            const drag = p.velocity.clone()
            drag.multiplyScalar(timeElapsed * 0.1)
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
            p.velocity.sub(drag)


            
        }
        this._particles.sort( (a, b) => {
            const d1 = this._camera.position.distanceTo(a.position)
            const d2 = this._camera.position.distanceTo(b.position)

            if(d1 > d2) {
                return -1
            }
            if(d1 < d2) {
                return 1
            }
            return 0
        })

    }
    Step(timeElapsed) {
        this._AddParticles(timeElapsed)
        this._UpdateParticles(timeElapsed)
        this._UpadteGeometry()

    }
}

export default ParticleSystem