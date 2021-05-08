import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

class Popup {
    label
    #labelRenderer
    #scene
    #camera

    constructor(scene,camera,dom,text) {
        this.#scene = scene
        this.#camera = camera
        const labelDiv = document.createElement( 'div' );
        labelDiv.className = 'label';
        labelDiv.textContent = 'moon';
        labelDiv.style.marginTop = '-1em';
        const label = new CSS2DObject( labelDiv );
        // label.position.set( 0, 10, 0 );
        this.label = label
        let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        console.log(dom)
        dom.appendChild( labelRenderer.domElement );
        this.#labelRenderer = labelRenderer
        this.animate()
        
    }
    getCSS2DRenderer() {
        return this.#labelRenderer
    }
    addTo(object) {
        console.log(object)
        console.log(object.position)
        object.add(this.label)
    }
    removeFrom(object) {
        object.remove(this.label)
    }
    
    animate() {
        requestAnimationFrame( this.animate.bind(this) )
        this.#labelRenderer.render( this.#scene, this.#camera );
    }
}

export default Popup