import * as glm from './math'
const CAMERA_MOVEMENT = {
    FORWARD: 0,
    BACKWARD: 1,
    LEFT: 2,
    RIGHT: 3,
    UP: 4,
    DOWN: 5
}

const YAW = -90.0
const PITCH = 0.0
const SENSITIVITY = 0.1
const SPEED = 2.5
const ZOOM = 45.0

export class Camera {
    /** @type {glm.vec} */
    position
    /** @type {glm.vec} */
    front
    /** @type {glm.vec} */
    up
    /** @type {glm.vec} */
    right
    /** @type {glm.vec} */
    worldUp

    /** @type {number} */
    yaw
    /** @type {number} */
    pitch
    /** @type {number} */
    movement_speed
    /** @type {number} */
    mouse_sensitivity
    /** @type {number} */
    zoom

    /**
     * 
     * @param {glm.vec} position 
     * @param {glm.vec} up 
     * @param {number} yaw 
     * @param {number} pitch 
     */
    constructor(position = new glm.vec(0.0, 0.0, 0.0), 
        up = new glm.vec(0.0, 1.0, 0.0),
        yaw = YAW,
        pitch = PITCH){
        this.position = position
        this.worldUp = up
        this.yaw = yaw
        this.pitch = pitch
        this.front = new glm.vec(0.0, 0.0, -1.0)
        this.movement_speed = SPEED
        this.mouse_sensitivity = SENSITIVITY
        this.zoom = ZOOM
        this.last_mouseX = undefined
        this.last_mouseY = undefined
        
        this.updateCameraVector()
        document.addEventListener("mousemove", (e) => {
            this.processMouseMovement(e.offsetX, e.offsetY)
        })
        document.addEventListener("keydown", (e) => {
            if(e.code == "KeyZ"){
                this.yaw = yaw
                this.pitch = pitch
                this.position = position
                this.front = new glm.vec(0.0, 0.0, -1.0)
                this.updateCameraVector()
            }
            if(e.code == "KeyA")
                this.processKeyBoard(CAMERA_MOVEMENT.LEFT, 0.01)
            if(e.code == "KeyW")
                this.processKeyBoard(CAMERA_MOVEMENT.FORWARD, 0.01)
            if(e.code == "KeyS")
                this.processKeyBoard(CAMERA_MOVEMENT.BACKWARD, 0.01)
            if(e.code == "KeyD")
                this.processKeyBoard(CAMERA_MOVEMENT.RIGHT, 0.01)
            if(e.code == "Space")
                this.processKeyBoard(CAMERA_MOVEMENT.UP, 0.01)
            if(e.shiftKey)
                this.processKeyBoard(CAMERA_MOVEMENT.DOWN, 0.01)

        })
    }
    getViewMatrix(){
        return glm.lookat(this.position, glm.vec.translate(this.position, this.front), this.up)
    }
    updateCameraVector(){
        /** @type {glm.vec} */
        const front = new glm.vec(0.0, 0.0, 0.0)
        front.x = Math.cos(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch))
        front.y = Math.sin(glm.radians(this.pitch))
        front.z = Math.sin(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch))
        this.front = front
        this.right = glm.normalize(glm.vec.cross(this.front, this.worldUp))
        this.up = glm.normalize(glm.vec.cross(this.right, this.front))
    }
    processMouseMovement(xoffset, yoffset, constrainPitch = true){
        if(!this.last_mouseX || !this.last_mouseY){
            this.last_mouseX = xoffset
            this.last_mouseY = yoffset
            return
        }
        let x = xoffset, y = yoffset
        x -= this.last_mouseX
        y -= this.last_mouseY
        
        this.last_mouseX = xoffset
        this.last_mouseY = yoffset
        x *= this.mouse_sensitivity
        y *= - this.mouse_sensitivity

        this.yaw += x;
        this.pitch += y;

        if(constrainPitch){
            if(this.pitch > 89.0)
                this.pitch = 89.0
            if(this.pitch < -89.0)
                this.pitch = 89.0
        }
        this.updateCameraVector()
    }
    processKeyBoard(direction, deltaTime = 0.5){
        const velocity = this.movement_speed * deltaTime
        if(direction == CAMERA_MOVEMENT.FORWARD)
            this.position = glm.vec.translate(this.position, this.front, velocity)
        if(direction == CAMERA_MOVEMENT.BACKWARD)
            this.position = glm.vec.translate(this.position, this.front, - velocity)
        if(direction == CAMERA_MOVEMENT.LEFT)
            this.position = glm.vec.translate(this.position, this.right, - velocity)
        if(direction == CAMERA_MOVEMENT.RIGHT)
            this.position = glm.vec.translate(this.position, this.right, velocity)
        if(direction == CAMERA_MOVEMENT.UP)
            this.position = glm.vec.translate(this.position, this.worldUp, velocity)
        if(direction == CAMERA_MOVEMENT.DOWN)
            this.position = glm.vec.translate(this.position, this.worldUp, - velocity)
    }
}