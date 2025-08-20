// Type definitions for Bun runtime
declare module "bun" {
  export interface Request {
    url: string;
    method: string;
    headers: Headers;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  export interface ServerConfig {
    port: number;
    fetch(req: Request): Promise<Response> | Response;
  }

  export function serve(config: ServerConfig): {
    port: number;
    hostname: string;
  };
}

// Global Bun types
declare global {
  interface Headers {
    get(name: string): string | null;
  }
}

export {};

