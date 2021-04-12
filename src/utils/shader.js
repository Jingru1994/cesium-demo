
const shader = {
    glowShader1: `
        varying vec3 v_pos;\n
        void main(void){\n
            vec4 position = czm_inverseModelView * vec4(v_pos,1);\n
            float glowRange = 360.0;\n
            gl_FragColor =  vec4(1, 1, 1 ,1);
            gl_FragColor *= vec4(vec3(position.z / 100.0), 1.0);
            float time = fract(czm_frameNumber / 360.0);
            time = abs(time - 0.5) * 2.0;
            float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
            gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
        }\n
    `,
    glowShader2: `
        varying vec3 v_positionEC;\n
        void main(void){\n
            vec4 position = czm_inverseModelView * vec4(v_positionEC,1);\n
            float glowRange = 360.0;\n
            gl_FragColor =  vec4(1, 1, 1 ,1);
            gl_FragColor *= vec4(vec3(position.z / 100.0), 1.0);
            float time = fract(czm_frameNumber / 360.0);
            time = abs(time - 0.5) * 2.0;
            float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
            gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
        }\n
    `,
    gradient: `
        attribute vec3 position3DHigh;
        attribute vec3 position3DLow;
        attribute vec3 normal;
        attribute vec2 st;
        attribute float batchId;

        varying vec4 v_positionEC;
        varying vec3 v_normalEC;

        void main()
        {
            vec4 p = czm_computePosition();
            vec4 eyePosition = czm_modelViewRelativeToEye * p;
            v_positionEC =  czm_inverseModelView * eyePosition;      // position in eye coordinates
            v_normalEC = czm_normal * normal;                         // normal in eye coordinates

            gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }
    `,
    fragmentShaderSource: `         
        varying vec3 v_positionEC;
            varying vec3 v_normalEC;
        void main() {
            float l = sqrt(pow(v_positionEC.x,2.0) + pow(v_positionEC.y,2.0) + pow(v_positionEC.z,2.0));
            float cy3 = fract((abs(l - 100000.0))/200000.0); 

            float cr = (56.0/255.0) + ((187.0/255.0) - (56.0/255.0))*cy3;
            float cg = (139.0/255.0) + ((186.0/255.0) - (139.0/255.0))*cy3;
            float cb = (255.0/255.0) + ((236.0/255.0) - (255.0/255.0))*cy3;

            gl_FragColor = vec4(cr, cg, cb, 1.0);
        }
    `,
}

export default shader;
