/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';
import { TextDecoder, TextEncoder } from 'node:util';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  WritableStream: { value: WritableStream },
  TransformStream: { value: TransformStream },
});

import { fetch, Headers, FormData, Request, Response } from 'undici';
import { Blob } from 'node:buffer';

// Minimal BroadcastChannel polyfill for MSW
class BroadcastChannelPolyfill {
  constructor(private _name: string) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postMessage(_msg: unknown) {
    /* no-op */
  }
  close() {
    /* no-op */
  }
  onmessage: ((msg: MessageEvent) => void) | null = null;
  addEventListener() {
    /* no-op */
  }
  removeEventListener() {
    /* no-op */
  }
  dispatchEvent() {
    return true;
  }
}

Object.defineProperties(globalThis, {
  BroadcastChannel: { value: BroadcastChannelPolyfill, configurable: true, writable: true },
  fetch: { value: fetch, configurable: true, writable: true },
  Blob: { value: Blob, configurable: true, writable: true },
  Headers: { value: Headers, configurable: true, writable: true },
  FormData: { value: FormData, configurable: true, writable: true },
  Request: { value: Request, configurable: true, writable: true },
  Response: { value: Response, configurable: true, writable: true },
});
