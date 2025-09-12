// Allow importing Cloudflare env in TypeScript without type package
declare module 'cloudflare:env' {
  export const env: any;
}

