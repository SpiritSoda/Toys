console.log(glm.lookat(
    [1.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
  ))
console.log(glm.perspective(glm.radians(45), 1920.0 / 1080.0, 0.1, 50.0))
let trans = new glm.mat(4)
trans = glm.rotate(trans, glm.radians(30), [0.0, 0.0, 1.0])
trans = glm.translate(trans, [0.0, 1.0, 2.0])
trans = glm.scale(trans, [2.0, 1.0, 0.5])
const v = new glm.vec(1.0, 0.0, 0.0)
console.log(glm.transform(v, trans))