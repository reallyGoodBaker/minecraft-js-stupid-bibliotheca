import { Matrix } from "../mat/mat4.js";
import { Vector3 } from "./vec3.js";
export interface Vector4 extends Vector3 {
    w: number;
}
export declare class Vec4 implements Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(init: number[]);
    static from(x: number, y: number, z: number, w: number): Vec4;
    static fromVec3(vec3: Vector4): Vec4;
    static fromVec4(vec4: Vector4): Vec4;
    static m(vec: Vector4): number;
    m(): number;
    static isZero(vec: Vector4): boolean;
    isZero(): boolean;
    static normalize(vec: Vector4): false | undefined;
    n(): false | undefined;
    static add(vec1: Vector4, vec2: Vector4): Vec4;
    add(vec: Vector4): Vec4;
    static sub(vec1: Vector4, vec2: Vector4): Vec4;
    sub(vec: Vector4): Vec4;
    static mul(vec: Vector4, scalar: number): Vec4;
    mul(scalar: number): Vec4;
    static div(vec: Vector4, scalar: number): Vec4;
    div(scalar: number): Vec4;
    static dot(vec1: Vector4, vec2: Vector4): number;
    dot(vec: Vector4): number;
    static multiply(vec: Vector4, mat: Matrix): Vec4 | Float64Array;
    multiply(mat: Matrix): Vec4 | Float64Array;
    valueOf(): Float64Array;
    toString(): string;
}
