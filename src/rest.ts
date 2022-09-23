import { getReponseError, RestError } from "./error";
import { camel2snake, isZero } from "./tools";

export type Fetcher = (req: Request) => Promise<Response>;

export type Polish = (t: any) => any;

export type RestOptions = {
    fetcher?: Fetcher;
    polish?: Polish,
    contentType?: string;
}

export default async function rest(method: string, endpoint: string, req: any, opt?: RestOptions): Promise<any> {
        let path = endpoint;
        let body: string | undefined;
        let headers: Record<string, string> = {};
        if (path.match(/\{(\w+)\}/) && typeof req === "object") {
            req = Object.assign({}, req);
            path = path.replace(/\{(\w+)\}/, (_, f) => {
                const v = `${(req as any)[f]}`;
                delete (req as any)[f];
                return v;
            });
        }
        switch (method) {
            case "PATCH":
            case "POST":
            case "PUT":
                if (!opt?.contentType || opt.contentType === "application/json") {
                    body = JSON.stringify(req);
                    headers["Content-Type"] = "application/json";
                } else if (opt.contentType === "application/x-www-form-urlencoded") {
                    body = new URLSearchParams(req).toString();
                    headers["Content-Type"] = "application/x-www-form-urlencoded";
                } else {
                    throw new Error(`Can not ${method} unknown content type: ${opt.contentType}`);
                }
                break
            case "DELETE":
            case "HEAD":
                path += queryString(req);
                break;
            case "GET":
                path += queryString(req);
                const cached = restCache[path];
                if(cached) return cached;
                break;
        }
        let resp: Response;
        const r = new Request(path, { method, body, headers });
        const fetcher = opt?.fetcher ?? globalThis.fetch;
        try {
            resp = await fetcher(r);
        } catch (err) {
            throw new RestError("network error", 0, `${err}`, method, path);
        }
        let data = await handleResponse(r, resp);
        if (opt?.polish) data = opt.polish(data);
        return data;
}

export var restCache: Record<string, any> = {};

export async function handleResponse<T>(req: Request, resp: Response): Promise<any> {
    if (!resp.ok) throw await getReponseError(req, resp);
    switch (resp.headers.get("Content-Type")) {
        case "application/json":
            return resp.json();
        case "test/plain":
            return resp.text();
        default:
            return
    }
}


function queryString(query: any): string {
    if(!query) return "";
    var entries: [string, unknown][] = Array.from(Object.entries(query))
        .map(([key, value]) => [camel2snake(key), value]);
    // sort keys ascending
    entries.sort(([keyA], [keyB]) => keyA > keyB ? 1 : -1);
    // filter out all zero values
    entries = entries.filter(([key, value]) => !isZero(value));
    if (entries.length === 0) return "";
    const queryString = entries.map(urlFlatValue).join("&");
    return "?" + queryString;
}

function urlFlatValue([key, value]: [string, any]): string {
    if (typeof value === "boolean")
        return key;
    return `${key}=${value}`;
}