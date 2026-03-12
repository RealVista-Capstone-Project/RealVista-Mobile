declare module 'text-encoding-polyfill' {
  export const TextEncoder: typeof globalThis.TextEncoder
  export const TextDecoder: typeof globalThis.TextDecoder
}
