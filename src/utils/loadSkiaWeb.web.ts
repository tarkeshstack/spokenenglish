// This package version doesn't publish a clean "/web" subpath export, so we
// reach into the compiled module directly; this file only ships in the web
// bundle (see loadSkiaWeb.ts for the native no-op counterpart).
// @ts-ignore - no bundled type declarations for this deep import path
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

// Web renders Skia via a WASM CanvasKit build that has to be fetched before
// any <Canvas> can mount.
export const skiaWebReady: Promise<void> = LoadSkiaWeb();
