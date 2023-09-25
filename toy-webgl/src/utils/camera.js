import * as glm from './math'
const CAMERA_MOVEMENT = {
    FORWARD: 0,
    BACKWARD: 1,
    LEFT: 2,
    RIGHT: 3
}

const YAW = -90.0
const PITCH = 0.0
const SENSITIVITY = 0.1
const SPEED = 2.5
const ZOOM = 45.0

class Camera {
    position
    front
    up
    right
    worldUp

    yaw
    pitch
    movement_speed
    mouse_sensitivity
    zoom

    /**
     * 
     * @param {glm.vec} position 
     * @param {glm.vec} up 
     * @param {number} yaw 
     * @param {number} pitch 
     */
    constructor(position = glm.vec(0.0, 0.0, 0.0), 
        up = glm.vec(0.0, 1.0, 0.0),
        yaw = YAW,
        pitch = PITCH){
        this.position = position
        this.worldUp = up
        this.yaw = yaw
        this.pitch = pitch
        this.front = glm.vec(0.0, 0.0, 1.0)
        this.movement_speed = SPEED
        this.mouse_sensitivity = SENSITIVITY
        this.zoom = ZOOM
        
        this.updateCameraVector()
    }
    getViewMatrix(){
        return glm.lookat(this.position, this.position + this.front, this.up)
    }
    updateCameraVector(){
        /** @type {glm.vec} */
        const front = glm.vec(0.0, 0.0, 0.0)
        front.x = Math.cos(glm.radians(YAW)) * Math.cos(glm.radians(this.pitch))
        front.y = Math.sin(glm.radians(this.pitch))
        front.z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(this.pitch))
        this.front = front
        this.right = glm.normalize(glm.vec.cross(this.front, this.worldUp))
        this.up = glm.normalize(glm.vec.cross(this.right, this.front))
    }
}