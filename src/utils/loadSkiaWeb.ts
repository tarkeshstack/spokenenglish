// Native (iOS/Android) uses the built-in Skia binding directly - nothing to
// load. See loadSkiaWeb.web.ts for the browser-only counterpart, which Metro
// picks up instead of this file when bundling for web (keeping the
// canvaskit-wasm binary out of the native app bundle entirely).
export const skiaWebReady: Promise<void> = Promise.resolve();
