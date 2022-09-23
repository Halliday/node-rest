export function formURLEncoded(d: object) {
    return Array.from(Object.entries(d)
        .filter(([key, value]) => typeof value == "string" || typeof value == "number")
        .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`))
        .join("&")
}

export function camel2snake(str: string): string {
    return str.replaceAll(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function camel2snakeObject(o: Object) {
    var p = {} as any;
    for(var [key, value] of Object.entries(o)) {
        p[camel2snake(key)] = value;
    }
    return p;
}

export function snake2camel(key: string) {
    return key.replaceAll(/_[a-z]/g, (c) => c[1].toUpperCase())
}

export function snake2camelObject(o: object) {
    var p = {} as any;
    for(var [key, value] of Object.entries(o)) {
        p[snake2camel(key)] = value;
    }
    return p;
}

export function isZero(v: any): boolean {
    if (v === null || v === undefined)
        return true;
    switch (typeof v) {
        case "string":
            return v === "";
        case "number":
            return v === 0;
        case "boolean":
            return v === false;
        case "undefined":
            return true;
    }
    if (Array.isArray(v))
    
        return v.length === 0;
    return v.toString() === "";
}
