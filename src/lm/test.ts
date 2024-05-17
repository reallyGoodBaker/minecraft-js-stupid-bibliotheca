import { Matrix } from './mat/mat4.js'
import { Vec3 } from './vec/vec3.js'
import { Vec4 } from './vec/vec4.js'

export function test() {
    const v = Matrix
        .identity()
        .setRotation(Math.PI / 4, new Vec3([0, 0, 1]))
        .translate(new Vec3([1, 2, 3]))
        .multiply(new Vec4([1, 1, 0, 1]))

    console.log(v)
}

test()