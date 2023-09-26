import { Shader } from "../utils/shader";
import * as glm from '../utils/math'
import { SIZE_F32 } from "../utils/constant";
import { GL } from "./00";
import { Camera } from "../utils/camera";

export function demo_01(){
  /** @type {WebGL2RenderingContext} */
  const { gl, width, height } = GL();
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
      gl_Position = projection * view * model * vec4(aPos, 1.0);
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
  gl.enable(gl.DEPTH_TEST)
  const shader = new Shader(gl, vertex_src, fragment_src)
  const vertices = [
    0.5 , 0.5 , 0.0, 1.0, 0.0, 1.0,
    0.5 , -0.5, 0.0, 0.0, 1.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,
    -0.5, 0.5 , 0.0, 0.0, 0.0, 1.0,
  ]
  const indices = [
    0, 1, 3,
    1, 2, 3,
  ]
  
  const VAO = gl.createVertexArray()
  const VBO = gl.createBuffer();
  const EBO = gl.createBuffer()
  gl.bindVertexArray(VAO)
  
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW)
  
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * SIZE_F32, 0)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * SIZE_F32, 3 * SIZE_F32)
  gl.enableVertexAttribArray(1)
  
  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  
  setInterval(() => {
    render()
  }, 50)

  const camera = new Camera(new glm.vec([0.0, 0.0, 3]))
  function render(){
    if (gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it.",
      );
      return
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    shader.use()
  
    let model       = new glm.mat(4)
    let view        = new glm.mat(4)
    let projection  = new glm.mat(4)
    model       = glm.rotate(model, glm.radians(-45), [1.0, 0.0, 0.0])
    model       = glm.translate(model, [0.3, 0.0, 0.0])
    view        = camera.getViewMatrix()
    projection  = glm.perspective(glm.radians(camera.zoom), width / height, 0.1, 100.0)
    shader.setMat4("model", model)
    shader.setMat4("view", view)
    shader.setMat4("projection", projection)
  
    gl.bindVertexArray(VAO)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0)
  }
}