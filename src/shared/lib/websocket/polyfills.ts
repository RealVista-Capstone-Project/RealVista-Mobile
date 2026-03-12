import { Buffer } from 'buffer'
import { TextEncoder, TextDecoder } from 'text-encoding-polyfill'

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any
}
