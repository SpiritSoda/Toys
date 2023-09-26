import { Shader } from "../utils/shader";
import * as glm from '../utils/math'
import { SIZE_F32 } from "../utils/constant";
import { GL } from "./00";
import { Camera } from "../utils/camera";

export function demo_02(){
    // Initialize the GL context
    const { /** @type {WebGL2RenderingContext} */gl, width, height } = GL();
    console.log(width, height)
    
    const l_vertex_src = `
    attribute vec3 aPos;
    
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;
      
    void main()
    {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
    }
    `
    const l_fragment_src = `
    void main()
    {
      gl_FragColor = vec4(1.0);
    } 
    `

    const c_vertex_src = `
    attribute vec3 aPos;
    attribute vec3 aNormal;
    
    varying lowp vec3 FragPos;
    varying lowp vec3 Normal;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;
      
    mat4 transpose(mat4 m) {
      return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
              m[0][1], m[1][1], m[2][1], m[3][1],
              m[0][2], m[1][2], m[2][2], m[3][2],
              m[0][3], m[1][3], m[2][3], m[3][3]);
    }
    mat4 inverse(mat4 m) {
      float
          a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
          a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
          a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
          a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
    
          b00 = a00 * a11 - a01 * a10,
          b01 = a00 * a12 - a02 * a10,
          b02 = a00 * a13 - a03 * a10,
          b03 = a01 * a12 - a02 * a11,
          b04 = a01 * a13 - a03 * a11,
          b05 = a02 * a13 - a03 * a12,
          b06 = a20 * a31 - a21 * a30,
          b07 = a20 * a32 - a22 * a30,
          b08 = a20 * a33 - a23 * a30,
          b09 = a21 * a32 - a22 * a31,
          b10 = a21 * a33 - a23 * a31,
          b11 = a22 * a33 - a23 * a32,
    
          det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
      return mat4(
          a11 * b11 - a12 * b10 + a13 * b09,
          a02 * b10 - a01 * b11 - a03 * b09,
          a31 * b05 - a32 * b04 + a33 * b03,
          a22 * b04 - a21 * b05 - a23 * b03,
          a12 * b08 - a10 * b11 - a13 * b07,
          a00 * b11 - a02 * b08 + a03 * b07,
          a32 * b02 - a30 * b05 - a33 * b01,
          a20 * b05 - a22 * b02 + a23 * b01,
          a10 * b10 - a11 * b08 + a13 * b06,
          a01 * b08 - a00 * b10 - a03 * b06,
          a30 * b04 - a31 * b02 + a33 * b00,
          a21 * b02 - a20 * b04 - a23 * b00,
          a11 * b07 - a10 * b09 - a12 * b06,
          a00 * b09 - a01 * b07 + a02 * b06,
          a31 * b01 - a30 * b03 - a32 * b00,
          a20 * b03 - a21 * b01 + a22 * b00) / det;
    }
    void main()
    {
        FragPos = vec3(model * vec4(aPos, 1.0));
        vec4 n = transpose(inverse(model)) * vec4(aNormal, 1.0);
        Normal = n.xyz;

        gl_Position = projection * view * vec4(FragPos, 1.0);
    }
    `
    const c_fragment_src = `
    precision mediump float;

    varying lowp vec3 FragPos;
    varying lowp vec3 Normal;

    uniform vec3 lightPos;
    uniform vec3 lightColor;
    uniform vec3 viewPos;
    uniform vec3 objectColor;

    void main()
    {
        // ambient
        float ambientStrength = 0.1;
        vec3 ambient = ambientStrength * lightColor;
      
        // diffuse 
        vec3 norm = normalize(Normal);
        vec3 lightDir = normalize(lightPos - FragPos);
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * lightColor;
      
        // specular
        float specularStrength = 0.5;
        vec3 viewDir = normalize(viewPos - FragPos);
        vec3 reflectDir = reflect(-lightDir, norm);  
        float specBase = max(dot(viewDir, reflectDir), 0.0);
        float spec = pow(specBase, 32.0);
        vec3 specular = specularStrength * spec * lightColor;  

        vec3 result = (ambient + diffuse + specular) * objectColor;
        gl_FragColor = vec4(result, 1.0);
    } 
    `
    gl.enable(gl.DEPTH_TEST)
    const c_shader = new Shader(gl, c_vertex_src, c_fragment_src)
    const l_shader = new Shader(gl, l_vertex_src, l_fragment_src)
    const vertices = [
      -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
       0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
       0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
       0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
      -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
      -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
    
      -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
       0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
       0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
       0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
      -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
      -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
    
      -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
      -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,
      -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
      -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
      -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,
      -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
    
       0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
       0.5,  0.5, -0.5,  1.0,  0.0,  0.0,
       0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
       0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
       0.5, -0.5,  0.5,  1.0,  0.0,  0.0,
       0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
    
      -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
       0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
       0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
       0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
      -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
      -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
    
      -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
       0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
       0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
       0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
      -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
      -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
    ]
    
    const cubeVAO = gl.createVertexArray()
    const VBO = gl.createBuffer()
    
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    gl.bindVertexArray(cubeVAO)
    
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * SIZE_F32, 0)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * SIZE_F32, 3 * SIZE_F32)
    gl.enableVertexAttribArray(1)

    const lightVAO = gl.createVertexArray()
    gl.bindVertexArray(lightVAO)

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * SIZE_F32, 0)
    gl.enableVertexAttribArray(0)
    
    setInterval(() => {
      render()
    }, 50)

    const lightPos = [8.2, 1.0, -2.0]
    const camera = new Camera(new glm.vec(1.5, 0.0, 3.0))

    let timer = 0
    
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
    
      c_shader.use()
      c_shader.setVec3("objectColor", [1.0, 0.5, 0.31])
      c_shader.setVec3("lightColor", [1.0, 1.0, 1.0])
      c_shader.setVec3("lightPos", lightPos)
      c_shader.setVec3("viewPos", camera.position)
      timer = (timer + 2) % 360
      let model         = new glm.mat(4)
      let view          = camera.getViewMatrix()
      let projection    = glm.perspective(glm.radians(camera.zoom), width / height, 0.1, 100.0)
      model = glm.rotate(model, glm.radians(- timer), [0.0, 1.0, 0.0])
      c_shader.setMat4("model", model)
      c_shader.setMat4("view", view)
      c_shader.setMat4("projection", projection)

      gl.bindVertexArray(cubeVAO)
      gl.drawArrays(gl.TRIANGLES, 0, 36)
    

      l_shader.use()
      l_shader.setMat4("view", view)
      l_shader.setMat4("projection", projection)
      model = new glm.mat(4)
      model = glm.translate(model, lightPos)
      model = glm.scale(model, [0.1, 0.1, 0.1])
      l_shader.setMat4("model", model)
    
      gl.bindVertexArray(lightVAO)
      gl.drawArrays(gl.TRIANGLES, 0, 36)
    }
}