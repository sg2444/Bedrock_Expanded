const isPointInsideAABB = function (loc, min, max) {
    return (loc.x >= min.x &&
        loc.x <= max.x &&
        loc.y >= min.y &&
        loc.y <= max.y &&
        loc.z >= min.z &&
        loc.z <= max.z);
};
const computeBounds = function (a, b) {
    const min = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        z: Math.min(a.z, b.z),
    };
    const max = {
        x: Math.max(a.x, b.x),
        y: Math.max(a.y, b.y),
        z: Math.max(a.z, b.z),
    };
    const size = {
        x: max.x - min.x,
        y: max.y - min.y,
        z: max.z - min.z,
    };
    const center = {
        x: min.x + ((max.x - min.x) / 2),
        y: min.y + ((max.y - min.y) / 2),
        z: min.z + ((max.z - min.z) / 2),
    };
    return {
        min,
        max,
        size,
        center
    };
};
export { isPointInsideAABB, computeBounds };
