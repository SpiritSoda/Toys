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
const width = canvas.width, height = canvas.height
console.log(width, height)
const vertex_src = `
attribute vec3 aPos;
attribute vec3 aColor;

varying lowp vec3 ourColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
  
void main()
{
	gl_Position = projection * view * model * vec4(aPos.x, aPos.y, aPos.z, 1.0);
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
const shader = new Shader(gl, vertex_src, fragment_src)
setInterval(() => {
  render()
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
    0, 0.5, 0.0, 0.0, 0.0, 1.0
  ]
  shader.use()

  let model       = new glm.mat(4)
  let view        = new glm.mat(4)
  let projection  = new glm.mat(4)
  // model       = glm.rotate(model, glm.radians(0), [0.0, 0.0, 1.0])
  view        = glm.translate(view, [0.2, 0.2, 3.0])
  // projection  = glm.perspective(glm.radians(45.0), width / height, 0.1, 100.0)

  const modelLoc = gl.getUniformLocation(shader.ID, "model")
  gl.uniformMatrix4fv(modelLoc, false, model.flat())
  const viewLoc = gl.getUniformLocation(shader.ID, "view")
  gl.uniformMatrix4fv(viewLoc, false, view.flat())
  const projLoc = gl.getUniformLocation(shader.ID, "projection")
  gl.uniformMatrix4fv(projLoc, false, projection.flat())

  const VAO = gl.createVertexArray()
  const VBO = gl.createBuffer();
  gl.bindVertexArray(VAO)
  
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4)
  gl.enableVertexAttribArray(1)

  gl.bindVertexArray(VAO)
  
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}