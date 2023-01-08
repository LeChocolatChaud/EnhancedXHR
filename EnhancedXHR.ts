/**
 * An easier way to use XMLHttpRequest
 */
export class EnhancedXMLHttpRequest {
    url: string;
    method: string;
    headers: any;
    data: any;
    xhr: XMLHttpRequest;

    /**
     * @param url The url of the resource to request.
     * @param method The method to use for the request.
     * @param headers The headers to use for the request (optional).
     * @param data The data to send with the request.
     */
    constructor(url: string, method: string, headers?: any, data?: any) {
        this.url = url;
        this.method = method;
        this.data = data ? data : null;
        this.headers = headers ? headers : null;
        this.xhr = new XMLHttpRequest();
    }

    /**
     * Sends the request.
     */
    send() {
        this.xhr.open(this.method, this.url, true);
        if (this.headers) {
            for (var key in this.headers) {
                this.xhr.setRequestHeader(key, this.headers[key]);
            }
        }
        this.xhr.send(JSON.stringify(this.data));
    }
    
    /**
     * Gets the response.
     * 
     * @param abortSignal An abort signal used for terminating the request.
     * @returns A promise that resolves to the response.
     * @throws An error if the request failed or not successful.
     */
    async getResponse(abortSignal?: AbortSignal) {
        return new Promise<string>((resolve, reject) => {
            var interval = setInterval(() => {
                if (this.xhr.readyState === 4) {
                    switch (this.xhr.status) {
                        case 200:
                            resolve(this.xhr.responseText);
                            clearInterval(interval);
                        case 404:
                            reject(
                                new XMLRequestFailError(
                                    `Resource "${this.url}" not found.`,
                                    404
                                )
                            );
                            clearInterval(interval);
                        case 500:
                            reject(
                                new XMLRequestFailError(
                                    "Internal server error.",
                                    500
                                )
                            );
                            clearInterval(interval);
                        default:
                            reject(
                                new XMLRequestFailError(
                                    "Unknown error.",
                                    this.xhr.status
                                )
                            );
                            clearInterval(interval);
                    }
                }
            }, 10);
            if (abortSignal) {
                abortSignal.addEventListener("abort", () => {
                    clearInterval(interval);
                    reject(new XMLRequestError("Abort signal received."));
                });
            }
        });
    }
}

export class XMLRequestError extends DOMException {
    constructor(message: string) {
        super(message);
    }
}

export class XMLRequestFailError extends XMLRequestError {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}
