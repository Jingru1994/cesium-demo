// import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import './popup.css'

class PopupLegend {
    label
    #labelRenderer
    #scene
    #camera

    constructor(scene,camera,dom,color) {
        this.#scene = scene
        this.#camera = camera
        const labelDiv = document.createElement( 'div' )
        labelDiv.className = 'three-popup-legend'
        const label = new CSS2DObject( labelDiv )
        this.label = label

        let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        if(color) {
            label.element.style.backgroundColor = color
            let panelColor = label.element.style.backgroundColor
            let rgb = panelColor.match(/\d+(.\d+)?/g).map(x => Number(x))
            let hsl = this.rgbToHsl(rgb)
            let hScale = hsl[2] < 40 ? 2.5 : (hsl[2] > 80 ? 0.7 : 1.25)
            label.element.style.borderColor = `hsl(${hsl[0]},${hsl[1]*0.7}%,${hsl[2]*hScale}%)`
        }
        dom.appendChild( labelRenderer.domElement );
        this.#labelRenderer = labelRenderer
        window.addEventListener( 'resize', () => {
            this.onWindowResize()
        })
        this.animate()
        
    }
    rgbToHsl(rgb){
        let r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255
        // let r = rgb[0], g = rgb[1], b = rgb[2]
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        // l = (max+min)/2
        // s = (max-min)/(1-Math.abs(2*l-1))
        // h = Math.round(Math.atan2(Math.sqrt(3)*(g-b),2*g-g-b)*180/Math.PI)

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s =  d / (1 - Math.abs(2*l - 1))
            switch(max){
                
                case r: h = ((g - b) / d) + (g<b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return [Math.floor(h), Math.round(s*100), Math.round(l*100)];
    }
    getCSS2DRenderer() {
        return this.#labelRenderer
    }
    addTo(object) {
        let position = object.geometry.boundingSphere.center
        this.label.position.x = position.x
        this.label.position.y = position.y
        this.label.position.z = position.z
        object.add(this.label)
        return this

    }
    setHtml(html) {
        this.label.element.innerHTML = html
        return this

    }
    setOffset(offset) {
        let position = this.label.position
        this.label.position.x = position.x + offset[0]
        this.label.position.y = position.y + offset[1]
        this.label.position.z = position.z + offset[2]
    }
    removeFrom(object) {
        object.remove(this.label)
    }
    onWindowResize() {
        this.#labelRenderer.setSize( window.innerWidth, window.innerHeight )
    }
    animate() {
        requestAnimationFrame( this.animate.bind(this) )
        this.#labelRenderer.render( this.#scene, this.#camera );
    }
}

export default PopupLegend