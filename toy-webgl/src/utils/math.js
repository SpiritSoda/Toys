class vec {
    /** @type {Array} */
    inner
    /**
     * 
     * @param {number | Array<number>} arg 
     */
    constructor(arg){
        Object.defineProperties(this, {
            length: {
                get(){
                    return this.inner.length
                },
                enumerable: true,
            },
            0: {
                get(){
                    return this.inner[0]
                },
                set(v){
                    this.inner[0] = v
                    return v
                },
                enumerable: true,
            },
            1: {
                get(){
                    return this.inner[1]
                },
                set(v){
                    this.inner[1] = v
                    return v
                },
                enumerable: true,
            },
            2: {
                get(){
                    return this.inner[2]
                },
                set(v){
                    this.inner[2] = v
                    return v
                },
                enumerable: true,
            },
            3: {
                get(){
                    return this.inner[3]
                },
                set(v){
                    this.inner[3] = v
                    return v
                },
                enumerable: true,
            },
            x: {
                get(){
                    return this.inner[0]
                },
                set(v){
                    this.inner[0] = v
                    return v
                },
                enumerable: true,
            },
            y: {
                get(){
                    return this.inner[1]
                },
                set(v){
                    this.inner[1] = v
                    return v
                },
                enumerable: true,
            },
            z: {
                get(){
                    return this.inner[2]
                },
                set(v){
                    this.inner[2] = v
                    return v
                },
                enumerable: true,
            },
            w: {
                get(){
                    return this.inner[3]
                },
                set(v){
                    this.inner[3] = v
                    return v
                },
                enumerable: true,
            }
        })
        if(arg instanceof Array){
            this.inner = [...arg].slice(0, 4)
            return
        }
        this.inner = [...([...arguments].slice(0, 4))]
    }
    [Symbol.iterator](){
        return this.inner[Symbol.iterator]()
    }
    /**
     * 
     * @param {number} k 
     */
    scale(k){
        for(let i = 0; i < this.inner.length; i ++)
            this.inner[i] *= k
    }
    norm(){
        const square = this.inner.reduce((p, c, i) => {
            return p + c * c 
        })
        return Math.sqrt(square)
    }
    /**
     * 
     * @param {number | vec} k 
     */
    translate(k){
        for(let i = 0; i < this.inner.length; i ++)
            this.inner[i] += k
    }
    /**
     * 
     * @param {vec | Array<number>} u 
     * @param {vec | Array<number>} v
     * @param {number} scale 
     * @returns {vec}
     */
    static translate(u, v, scale = 1){
        if(u.length != v.length)
            throw "can't translate on vector with different length"
        const inner = []
        for(let i = 0; i < u.length; i ++){
            inner.push(u[i] + v[i] * scale)
        }
        return new vec(inner)
    }
    /**
     * 
     * @param {vec} u
     * @param {vec} v
     * @returns {number}
     */
    static dot(u, v){
        if(u.length != v.length)
            throw "can't dot on vector with different length"
        let ans = 0
        for(let i = 0; i < u.length; i ++){
            ans += u[i] * v[i]
        }
        return ans;
    }
    /**
     * 
     * @param {vec | Array<number>} u
     * @param {vec | Array<number>} v
     * @returns {vec}
     */
    static cross(u, v){
        if(u.length != v.length)
            throw "can't cross on vector with different length"
        if(u.length != 3)
            throw "don't support cross multiplication on vector with not length 3"
        return new vec(u[1] * v[2] - u[2] * v[1], 
                        u[2] * v[0] - u[0] * v[2],
                        u[0] * v[1] - u[1] * v[0]);
    }
}
class mat {
    /** @type {Array} */
    inner
    /**
     * 
     * @param {Array<Array<number> | number | vec> | number} arg 
     */
    constructor(arg){
        Object.defineProperties(this, {
            length: {
                get(){
                    return this.inner.length
                },
                enumerable: true,
            },
            0: {
                get(){
                    return this.inner[0]
                },
                enumerable: true,
            },
            1: {
                get(){
                    return this.inner[1]
                },
                enumerable: true,
            },
            2: {
                get(){
                    return this.inner[2]
                },
                enumerable: true,
            },
            3: {
                get(){
                    return this.inner[3]
                },
                enumerable: true,
            }
        })
        if(!(arg instanceof Array)){
            this.inner = []
            for(let i = 0; i < arg; i ++)
                this.inner.push([...new Array(i).fill(0), 1, ...new Array(arg - i - 1).fill(0)])
            return
        }
        const col = (() => {
            let max = 0;
            arg.forEach((vec) => {
                max = Math.max(max, vec.length)
            })
            return max
        })();
        this.inner = []
        for(let vec of arg){
            const v = [...vec]
            v.push(...new Array(col - v.length).fill(0))
            this.inner.push(v)
        }
    }
    /**
     * 
     * @param {number} k 
     */
    scale(k){
        for(let i = 0; i < this.inner.length; i ++)
            for(let j = 0; j < this.inner.length; j ++)
                this.inner[i][j] *= k
    }
    norm(){
        const square = this.inner.flat().reduce((p, c, i) => {
            return p + c * c 
        })
        return Math.sqrt(square)
    }
    /**
     * 
     * @param {mat} mat1 
     * @param {mat} mat2 
     */
    static mul(mat1, mat2){
        const row1 = mat1.length, col1 = mat1[0]?.length
        const row2 = mat2.length, col2 = mat2[0]?.length
        if(col1 != row2)
            throw "matrix size not match"
        const inner = new Array(row1)
        for(let i = 0; i < row1; i ++)
            inner[i] = new Array(col2).fill(0)
        for(let i = 0; i < row1; i ++){
            for(let j = 0; j < col2; j ++){
                for(let k = 0; k < row2; k ++)
                    inner[i][j] += mat1[i][k] * mat2[k][j]
            }
        }
        return new mat(inner)
    }
}
/**
 * 
 * @param {Array<number> | vec} pos 
 * @param {Array<number> | vec} direction 
 * @param {Array<number> | vec} up 
 */
function lookat(pos, target, up){
    if(pos.length != 3)
        throw "vector position is not a 3D vector"
    if(target.length != 3)
        throw "vector direction is not a 3D vector"
    if(up.length != 3)
        throw "vector up is not a 3D vector"
    const direction = vec.translate(target, pos, -1), right = vec.cross(direction, up)
    const L = [
        [...right, 0],
        [...up, 0],
        [...direction, 0],
        [0, 0, 0, 1]
    ], R = [
        [1, 0, 0, - pos[0]],
        [0, 1, 0, - pos[1]],
        [0, 0, 1, - pos[2]],
        [0, 0, 0, 1]
    ]
    return mat.mul(L, R)
}
/**
 * 
 * @param {vec | mat} vector 
 * @returns {vec | mat}
 */
function normalize(vector){
    const res = new vec(vector.inner)
    res.scale(1 / vector.norm())
    return res
}
/**
 * 
 * @param {number} degree 
 * @returns 
 */
function radians(degree){
    return degree * Math.PI / 180
}
/**
 * 
 * @param {number} radian 
 * @param {number} aspect 
 * @param {number} znear 
 * @param {number} zfar 
 */
function perspective(fovy, aspect, znear, zfar){
    const n = -znear, 
        f = -zfar, 
        t = znear * Math.tan(fovy / 2),
        b = -t,
        r = t * aspect,
        l = -r
    return new mat([
        [2 * n / (r - l), 0, 0, 0],
        [0, 2 * n / (t - b), 0, 0],
        [0, 0, (n + f) / (f - n), -2 * n * f / (f - n)],
        [0, 0, 1, 0]
    ])
}
/**
 * 
 * @param {mat} matrix 
 */
function isMatrix4D(matrix){
    return matrix.length == 4 && matrix[0].length == 4
}
/**
 * 
 * @param {vec} vector
 * @returns 
 */
function isVector3D(vector){
    return vector.length == 3
}
/**
 * 
 * @param {mat} transform
 * @param {vec | Array<number>} scales 
 * @returns
 */
function scale(transform, scales){
    if(!isMatrix4D(transform))
        throw "transform must be 4D"
    if(!isVector3D(scales))
        throw "scales must be 3D"
    const matrix = [
        [scales[0], 0, 0, 0],
        [0, scales[1], 0, 0],
        [0, 0, scales[2], 0],
        [0, 0, 0, 1]
    ]
    return mat.mul(matrix, transform)
}
/**
 * 
 * @param {mat} transform 
 * @param {number} theta
 * @param {vec | Array<number>} axis 
 * @returns
 */
function rotate(transform, theta, axis){
    if(!isMatrix4D(transform))
        throw "transform must be 4D"
    if(!isVector3D(axis))
        throw "axis must be 3D"
    const a = Math.cos(theta / 2), b = Math.sin(theta / 2) * axis[0], c = Math.sin(theta / 2) * axis[1], d = Math.sin(theta / 2) * axis[2]
    const quaternion = [
        [1 - 2 * c * c - 2 * d * d, 2 * b * c - 2 * a * d, 2 * a * c + 2 * b * d, 0],
        [2 * b * c + 2 * a * d, 1 - 2 * b * b - 2 * d * d, 2 * c * d - 2 * a * b, 0],
        [2 * b * d - 2 * a * c, 2 * a * b + 2 * c * d, 1 - 2 * b * b - 2 * c * c, 0],
        [0, 0, 0, 1]
    ]
    return mat.mul(quaternion, transform)
}
/**
 * 
 * @param {mat} transform 
 * @param {vec | Array<number>} operation 
 */
function translate(transform, operation){
    if(!isMatrix4D(transform))
        throw "transform must be 4D"
    if(!isVector3D(operation))
        throw "operation must be 3D"
    const matrix = [
        [1, 0, 0, operation[0]],
        [0, 1, 0, operation[1]],
        [0, 0, 1, operation[2]],
        [0, 0, 0, 1]
    ]
    return mat.mul(matrix, transform)
}
/**
 * 
 * @param {mat} matrix 
 * @returns 
 */
function transpose(matrix){
    const m = matrix.length, n = matrix[0].length
    const inner = new Array(n)
    for(let i = 0; i < n; i ++){
        inner[i] = new Array(m).fill(0)
        for(let j = 0; j < m; j ++)
            inner[i][j] = matrix[j][i]
    }
    return new mat(inner)
}
/**
 * 
 * @param {vec | Array<number>} vector 
 * @param {mat} matrix 
 * @returns 
 */
function transform(vector, matrix){
    if(!isMatrix4D(matrix))
        throw "transform must be 4D"
    if(!isVector3D(vector))
        throw "vector must be 3D"
    const vec_in_mat = transpose([[...vector, 1]])
    const result = mat.mul(matrix, vec_in_mat)
    return result.inner.flat().slice(0, 3)
}

export {
    vec,
    mat,
    lookat,
    radians,
    normalize,
    perspective,
    scale,
    rotate,
    translate,
    transpose,
    transform
}