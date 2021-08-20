class DistricTerrain {
    constructor(params) {
        if(!params) {
            throw Error('Creating ParticleSystem instance must provide parameters')
        }

        const width = params.width || 100
        const height = params.height || 100
        const heightTexture = params.heightTexture
        const diffuseTexture = params.diffuseTexture
        const color = params.color || new THREE.Color(0x244931)

        this.createTerrain(width, height,heightTexture)
        this.createBottom()

        const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem5.png')
        heightTexture.anisotropy = 16
        const heightTexture1 = new THREE.TextureLoader().load('images/rs/beijing_dem5.png')
        const diffiseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite3.png')
        const vertexShader = `
            uniform sampler2D heightMap;
            
            uniform float heightRatio;
            varying vec2 vUv;
            varying float hValue;
            varying float isTrue;
            void main() {
                isTrue = 1.0;
                vUv = uv;
                vec3 pos = position;
                hValue = texture2D(heightMap, vUv).r;
                pos.z = hValue * heightRatio;
                if(texture2D(heightMap, vUv).a < 1.0){
                    pos.z = 0.0;
                    isTrue = 0.0;
                }
                if(texture2D(heightMap, vUv).r == 0.0 && texture2D(heightMap, vUv).b == 0.0){
                    pos.z = -3.0;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `
        const fragmentShader = `
            uniform sampler2D heightMap;
            uniform sampler2D diffuseMap;
            varying float hValue;
            varying vec2 vUv;
            varying float isTrue;
            void main() {
                float alpha;
                alpha = 0.0;
                if(isTrue == 1.0){
                    alpha = 1.0;
                }
                gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, alpha );
            }
        `
        const material1 = new THREE.ShaderMaterial({
            uniforms: {
                heightMap: {value: heightTexture},
                heightRatio: {value: 3},
                diffuseMap: {value: diffiseTexture}
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            // side: THREE.DoubleSide
        })

        // heightTexture.
        const planeGeometry = new THREE.PlaneGeometry(100,100,500,500)
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            map: diffiseTexture,
            side: THREE.DoubleSide
        })
        const plane = new THREE.Mesh(planeGeometry,material1)
        // plane.rotation.x = Math.PI/4
        // plane.position.set(0,60,60)
        this.scene.add(plane)

        const vertexShader1 = `
            varying vec2 vUv;
            void main() {
                
                vUv = uv;
                vec3 pos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `
        const fragmentShader1 = `
            uniform sampler2D heightMap1;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float alpha = 0.0;
                float isTrue = 1.0;
                if(texture2D(heightMap1, vUv).a < 1.0){
                    isTrue = 0.0;
                }
                if(isTrue == 1.0){
                    alpha = 1.0;
                }
                
                // float alpha = 1.0;
                // if(texture2D(heightMap1, vUv).a < 1.0){
                //     alpha = 0.0;
                // }

                gl_FragColor = vec4(color.rgb, alpha);
            }
        `

        const bottomGeometry = new THREE.PlaneGeometry(100,100,500,500)
        const bottomMaterial = new THREE.ShaderMaterial({
            uniforms: {
                heightMap1: {value: heightTexture1},
                color: {value: new THREE.Color(0x244931)}
            },
            vertexShader: vertexShader1,
            fragmentShader: fragmentShader1,
            transparent: true,
            side: THREE.DoubleSide
        })
        const bottomPlane = new THREE.Mesh(bottomGeometry,bottomMaterial)
        bottomPlane.position.set(0,0,-3)
        this.scene.add(bottomPlane)
    }
    createTerrain(width, height, heightTexture) {
        const heightTexture1 = new THREE.TextureLoader().load('images/rs/beijing_dem5.png')
        const diffiseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite3.png')
        const vertexShader = `
            uniform sampler2D heightMap;
            uniform float heightRatio;

            varying vec2 vUv;
            varying float hValue;
            varying float isTrue;
            void main() {
                isTrue = 1.0;
                vUv = uv;
                vec3 pos = position;
                hValue = texture2D(heightMap, vUv).r;
                pos.z = hValue * heightRatio;
                if(texture2D(heightMap, vUv).a < 1.0){
                    pos.z = 0.0;
                    isTrue = 0.0;
                }
                if(texture2D(heightMap, vUv).r == 0.0 && texture2D(heightMap, vUv).b == 0.0){
                    pos.z = -3.0;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `
        const fragmentShader = `
            uniform sampler2D heightMap;
            uniform sampler2D diffuseMap;

            varying float hValue;
            varying vec2 vUv;
            varying float isTrue;
            void main() {
                float alpha;
                alpha = 0.0;
                if(isTrue == 1.0){
                    alpha = 1.0;
                }
                gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, alpha );
            }
        `
        const material1 = new THREE.ShaderMaterial({
            uniforms: {
                heightMap: {value: heightTexture},
                heightRatio: {value: 3},
                diffuseMap: {value: diffiseTexture}
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        })
        const planeGeometry = new THREE.PlaneGeometry(width,height,width*5,height*5)
        const terrain = new THREE.Mesh(planeGeometry,material1)
        return terrain

    }

}
export default DistricTerrain