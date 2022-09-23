export class RestError {
    constructor(
        readonly name: string,
        readonly code: number,
        readonly desc: string | null,
        readonly method: string,
        readonly url: string) {
    }
}

export async function getReponseError(req: Request, resp: Response) {
    if (resp.headers.get("Content-Type") === "application/json") {
        const error = await resp.json() as any;
        return new RestError(
            error.name ?? resp.statusText,
            error.code ?? resp.status,
            error.description ?? error.desc ?? error.text ?? null,
            req.method,
            req.url
        );
    }
    const text = await resp.text();
    return new RestError(resp.statusText, resp.status, text, req.method, req.url);
}

