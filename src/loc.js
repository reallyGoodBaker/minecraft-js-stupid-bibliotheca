import * as server from "@minecraft/server";
import { BlockLocation, Dimension, Entity, XYRotation } from "@minecraft/server";

function fromArray(array) {
    let dimension;
    let any= [];
    let anyIndex = 0;
    array.forEach(value => {
        if(value instanceof Dimension || typeof value === "string") {
            if(dimension !== undefined) throw new TypeError("Incorrect number of arguments to function. Expected 1 dimension, received 2");
            dimension = typeof value === "string" ? server.world.getDimension(value) : value;
        } else if(value instanceof XYRotation) {
            any[3] = value.x, any[4] = value.y;
        } else {
            if(any[3] !== undefined && anyIndex == 3)
                throw new TypeError("Incorrect arguments to function. Expected 2 numbers or XYRotation', received more");
            any[anyIndex] = value, anyIndex++;
        }
    });
    return new Location(any[0], any[1], any[2], any[3], any[4], dimension);
}

function fromObject(object) {
    let { x, y, z, rotation, rx, ry, dimension } = object;
    if(rotation !== undefined && (rx !== undefined || ry !== undefined))
        throw new TypeError("Incorrect number of arguments to function. Expected 3 to 6, received 7");
    else if(rotation !== undefined) [rx, ry] = [rotation.x, rotation.y];
    let location = new Location(x, y, z, rx, ry, dimension);
    return location;
}

export class Location {
    dimension;
    rx;
    ry;
    x;
    y;
    z;
    [Symbol.toPrimitive](hint) {
        if (hint === 'string') { return this.toString(); }
        return null;
    }
    above() {
        return new Location(this.x, this.y+1, this.z, this.rx, this.ry, this.dimension);
    }
    constructor(x, y, z, rx, ry, dimension) {
        if(x === undefined || y === undefined || z === undefined || (rx !== undefined && ry === undefined))
            throw new TypeError("Native variant type conversation failed");
        [this.x, this.y, this.z, this.rx, this.ry, this.dimension] = [x, y, z, rx, ry, dimension];
    }
    equals(other) {
        if(other instanceof Entity) other = fromObject(other);
        return this.x === other.x
            && this.y === other.y
            && this.z === other.z
            && this.rx === other.rx
            && this.ry === other.ry
            && this.dimension?.id === other.dimension?.id;
    }
    isNear(other, epsilon) {
        return this.toLocation().isNear(other.toLocation(), epsilon);
    }
    toBlock(dimension) {
        dimension = dimension || this.dimension;
        dimension ? void 0 : (() => {throw new ReferenceError("'dimension' is required")})();
        return dimension.getBlock(new BlockLocation(this.x, this.y, this.z));
    }
    toLocation() {
        return new server.Location(this.x, this.y, this.z);
    }
    static from(...any) {
        if(any.length > 1) return fromArray(any);
        else if(any[0] instanceof Array) return fromArray(any[0]);
        else if(any[0] instanceof Object) return fromObject(any[0]);
    }
}
