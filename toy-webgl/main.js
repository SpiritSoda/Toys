import { Shader } from "./src/utils/shader";
import * as glm from './src/utils/math'

console.log(glm.lookat(
  [1.0, 1.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 1.0]
))
console.log(glm.perspective(glm.radians(45), 1920.0 / 1080.0, 0.1, 50.0))
let trans = new glm.mat(4)
trans = glm.rotate(trans, glm.radians(30), [0.0, 0.0, 1.0])
trans = glm.translate(trans, [0.0, 1.0, 1.0])
trans = glm.scale(trans, [2.0, 1.0, 0.5])
const v = new glm.vec(1.0, 0.0, 0.0)
console.log(glm.transform(v, trans))

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("glcanvas");
// Initialize the GL context
/** @type {WebGL2RenderingContext} */
const gl = canvas?.getContext("webgl2");
const vertex_src = `
attribute vec3 aPos;
attribute vec3 aColor;

varying lowp vec3 ourColor;
  
void main()
{
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
  ourColor = aColor;
}

`
const fragment_src = `
varying lowp vec3 ourColor;

void main()
{
  gl_FragColor = vec4(ourColor, 1.0);
} 
`

setInterval(() => {
  // render()
}, 50)

function render(){
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
  const vertices = [
    -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,
    0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
    0.0, 0.5, 0.0, 0.0, 0.0, 1.0
  ]
  const VAO = gl.createVertexArray()
  const VBO = gl.createBuffer();
  gl.bindVertexArray(VAO)
  
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4)
  gl.enableVertexAttribArray(1)

  const shader = new Shader(gl, vertex_src, fragment_src)
  shader.use()

  gl.bindVertexArray(VAO)
  
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}