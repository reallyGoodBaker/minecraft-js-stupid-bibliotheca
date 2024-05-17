export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
export declare class Vec3 implements Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(init: number[]);
    static from(x: number, y: number, z: number): Vec3;
    static fromVec3(vec3: Vector3): Vec3;
    static m(vec3: Vector3): number;
    m(): number;
    static isZero(vec: Vector3): boolean;
    isZero(): boolean;
    static normalize(vec: Vector3): false | undefined;
    n(): false | undefined;
    static add(vec1: Vector3, vec2: Vector3): Vec3;
    add(vec: Vector3): Vec3;
    static sub(vec1: Vector3, vec2: Vector3): Vec3;
    sub(vec: Vector3): Vec3;
    static mul(vec: Vector3, scalar: number): Vec3;
    mul(scalar: number): Vec3;
    static div(vec: Vector3, scalar: number): Vec3;
    div(scalar: number): Vec3;
    static dot(vec1: Vector3, vec2: Vector3): number;
    dot(vec: Vector3): number;
    static cross(vec1: Vector3, vec2: Vector3): Vec3;
    cross(vec: Vector3): Vec3;
    valueOf(): Float64Array;
    toString(): string;
}
