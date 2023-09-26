export function GL(){
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("glcanvas");
    // Initialize the GL context
    /** @type {WebGL2RenderingContext} */
    const gl = canvas?.getContext("webgl2");
    return {
        gl,
        width: canvas?.width,
        height: canvas?.height
    }
}