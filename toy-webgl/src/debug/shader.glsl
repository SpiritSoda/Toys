
    attribute vec3 aPos;
    attribute vec3 aNormal;
    
    varying lowp vec3 FragPos;
    varying lowp vec3 Normal;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;
      
    void main()
    {
        FragPos = vec3(model * vec4(aPos, 1.0));
        vec4 n = transpose(inverse(model)) * vec4(aNormal, 1.0);
        Normal = aNormal;

        gl_Position = projection * view * vec4(FragPos, 1.0);
    }