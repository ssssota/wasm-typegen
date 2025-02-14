import { type Options, WasmTypesGenerator } from "./generator.js";

/**
 * @param {BufferSource} buf WebAssembly binary
 * @param {Options} [options] Options
 * @returns {string} TypeScript code.
 */
export function generateWasmTypes(
	buf: BufferSource,
	options?: Options,
): string {
	return new WasmTypesGenerator(buf, options).generate();
}
