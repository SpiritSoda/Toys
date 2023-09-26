import { mat, vec } from "./math"

export class Shader{
    /** @type {WebGLProgram} */
    ID
    /** @type {WebGL2RenderingContext} */
    GL
    /**
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {string} vertexPath 
     * @param {string} fragmentPath 
     * @returns 
     */
    constructor(gl, vertex_src, fragment_src){
        this.GL = gl
        console.log("GLSL language version:", gl.SHADING_LANGUAGE_VERSION)
        const vertexShader = this.GL.createShader(this.GL.VERTEX_SHADER)
        if(!vertexShader)
          return
        this.GL.shaderSource(vertexShader, vertex_src)
        this.GL.compileShader(vertexShader)
        
        const fragmentShader = this.GL.createShader(this.GL.FRAGMENT_SHADER)
        if(!fragmentShader)
          return
        this.GL.shaderSource(fragmentShader, fragment_src)
        this.GL.compileShader(fragmentShader)

        this.ID = this.GL.createProgram()
        if(!this.ID)
            return
        this.GL.attachShader(this.ID, vertexShader)
        this.GL.attachShader(this.ID, fragmentShader)
        this.GL.linkProgram(this.ID)

        this.GL.deleteShader(vertexShader)
        this.GL.deleteShader(fragmentShader)
    }
    use(){
        this.GL.useProgram(this.ID)
    }
    /**
     * 
     * @param {string} name 
     * @param {boolean} value 
     */
    setBool(name, value){
        this.GL.uniform1i(this.GL.getUniformLocation(this.ID, name), value)
    }
    /**
     * 
     * @param {string} name 
     * @param {number} value 
     */
    setInt(name, value){
        this.GL.uniform1i(this.GL.getUniformLocation(this.ID, name), value)
    }
    /**
     * 
     * @param {string} name 
     * @param {number} value 
     */
    setFloat(name, value){
        this.GL.uniform1f(this.GL.getUniformLocation(this.ID, name), value)
    }
    /**
     * 
     * @param {string} name 
     * @param {mat} value 
     */
    setMat3(name, value){
        this.GL.uniformMatrix3fv(this.GL.getUniformLocation(this.ID, name), false, value.flat())
    }
    /**
     * 
     * @param {string} name 
     * @param {mat} value 
     */
    setMat4(name, value){
        this.GL.uniformMatrix4fv(this.GL.getUniformLocation(this.ID, name), false, value.flat())
    }
    /**
     * 
     * @param {string} name 
     * @param {vec | Array<number>} value 
     */
    setVec2(name, value){
        this.GL.uniform2fv(this.GL.getUniformLocation(this.ID, name), value instanceof vec ? value.flat(): new Float32Array(value))
    }
    /**
     * 
     * @param {string} name 
     * @param {vec | Array<number>} value 
     */
    setVec3(name, value){
        this.GL.uniform3fv(this.GL.getUniformLocation(this.ID, name), value instanceof vec ? value.flat(): new Float32Array(value))
    }
    /**
     * 
     * @param {string} name 
     * @param {vec | Array<number>} value 
     */
    setVec4(name, value){
        this.GL.uniform4fv(this.GL.getUniformLocation(this.ID, name), value instanceof vec ? value.flat(): new Float32Array(value))
    }
}