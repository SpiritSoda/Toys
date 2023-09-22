export class Shader{
    ID
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
        this.GL.uniform1i(this.GL.getUniformLocation(ID, name), value)
    }
    /**
     * 
     * @param {string} name 
     * @param {number} value 
     */
    setInt(name, value){
        this.GL.uniform1i(this.GL.getUniformLocation(ID, name), value)
    }
    /**
     * 
     * @param {string} name 
     * @param {number} value 
     */
    setFloat(){
        this.GL.uniform1f(this.GL.getUniformLocation(ID, name), value)
    }
}