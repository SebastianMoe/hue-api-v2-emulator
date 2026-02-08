interface Point { x: number; y: number; }

const GAMUT_C_RED = { x: 0.6915, y: 0.3083 };
const GAMUT_C_GREEN = { x: 0.1700, y: 0.7000 };
const GAMUT_C_BLUE = { x: 0.1532, y: 0.0475 };

const GAMUT_C = [GAMUT_C_RED, GAMUT_C_GREEN, GAMUT_C_BLUE];

function crossProduct(p1: Point, p2: Point): number {
    return (p1.x * p2.y) - (p1.y * p2.x);
}

function isPointInTriangle(p: Point, triangle: Point[]): boolean {
    const p1 = triangle[0];
    const p2 = triangle[1];
    const p3 = triangle[2];

    const val1 = (p1.x - p.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p1.y - p.y);
    const val2 = (p2.x - p.x) * (p3.y - p2.y) - (p3.x - p2.x) * (p2.y - p.y);
    const val3 = (p3.x - p.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p3.y - p.y);

    return !((val1 < 0 || val2 < 0 || val3 < 0) && (val1 > 0 || val2 > 0 || val3 > 0));
}

function getClosestPointOnLine(p: Point, a: Point, b: Point): Point {
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    const ap_dot_ab = ap.x * ab.x + ap.y * ab.y;
    let t = ap_dot_ab / ab2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    return { x: a.x + ab.x * t, y: a.y + ab.y * t };
}

function fitPointToGamut(point: Point, gamut: Point[]): Point {
    if (isPointInTriangle(point, gamut)) {
        return point;
    }

    const pAB = getClosestPointOnLine(point, gamut[0], gamut[1]);
    const pBC = getClosestPointOnLine(point, gamut[1], gamut[2]);
    const pCA = getClosestPointOnLine(point, gamut[2], gamut[0]);

    const dAB = (point.x - pAB.x) ** 2 + (point.y - pAB.y) ** 2;
    const dBC = (point.x - pBC.x) ** 2 + (point.y - pBC.y) ** 2;
    const dCA = (point.x - pCA.x) ** 2 + (point.y - pCA.y) ** 2;

    let minD = dAB;
    let result = pAB;

    if (dBC < minD) {
        minD = dBC;
        result = pBC;
    }
    if (dCA < minD) {
        result = pCA;
    }

    return result;
}

export function xyToHex(x: number, y: number, brightness: number): string {
    if (brightness === undefined) brightness = 100;

    const inputPoint = { x, y };
    const correctedFunc = fitPointToGamut(inputPoint, GAMUT_C);
    
    x = correctedFunc.x;
    y = correctedFunc.y;

    const z = 1.0 - x - y;
    const Y = brightness / 100;
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    function gammaCorrect(v: number): number {
        return v <= 0.0031308 ? 12.92 * v : (1.0 + 0.055) * Math.pow(v, 1.0 / 2.4) - 0.055;
    }

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);

    function clamp(v: number): number { return Math.max(0, Math.min(1, v)); }
    
    const max = Math.max(r, g, b);
    if (max > 1) {
        r /= max; 
        g /= max; 
        b /= max;
    }

    r = clamp(r);
    g = clamp(g);
    b = clamp(b);

    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
