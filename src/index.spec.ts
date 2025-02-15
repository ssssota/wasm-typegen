import { expect, test } from "vitest";
import initializeWabt from "wabt";
import { type Options, generateWasmTypes } from "./index.js";
async function wat2wasm(wat: string): Promise<Uint8Array> {
	const wabt = await initializeWabt();
	const mod = wabt.parseWat("test.wat", wat);
	return mod.toBinary({ write_debug_names: true }).buffer;
}
const opts = {
	noEmitInstantiateFunc: true,
	banner: "",
} as const satisfies Options;
test("import and export", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "env" "log" (func $log (param i32)))
	(func (export "addTwo") (param i32 i32) (result i32)
		local.get 0
		local.get 1
		i32.add))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type i32 = number & Record<never, never>;
		type Imports = {
			env: {
				log(p0: i32): void;
			};
		};
		type Exports = {
			addTwo(p0: i32, p1: i32): i32;
		};
		"
	`);
});

test("no imports and exports", async () => {
	const wasm = await wat2wasm("(module)");
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {};
		type Exports = {};
		"
	`);
});

test("single import, single param, single result", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "env" "log" (func $log (param i32))))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type i32 = number & Record<never, never>;
		type Imports = {
			env: {
				log(p0: i32): void;
			};
		};
		type Exports = {};
		"
	`);
});
test("multiple imports, multiple params, multiple results", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "date" "now" (func $now (result i64)))
	(import "env" "log" (func $log (param i32)))
	(import "env" "add" (func $add (param i32 i32) (result i32)))
	(import "env" "sub" (func $sub (param i32 i32) (result i32 i32))))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type i64 = bigint & Record<never, never>;
		type i32 = number & Record<never, never>;
		type Imports = {
			date: {
				now(): i64;
			};
			env: {
				log(p0: i32): void;
				add(p0: i32, p1: i32): i32;
				sub(p0: i32, p1: i32): [i32, i32];
			};
		};
		type Exports = {};
		"
	`);
});
test("single export, single param, single result", async () => {
	const wasm = await wat2wasm(`\
(module
	(func (export "addTwo") (param i32 i32) (result i32)
		local.get 0
		local.get 1
		i32.add))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type i32 = number & Record<never, never>;
		type Imports = {};
		type Exports = {
			addTwo(p0: i32, p1: i32): i32;
		};
		"
	`);
});
test("multiple exports, multiple params, multiple results", async () => {
	const wasm = await wat2wasm(`\
(module
	(func $getAnswer (result i32))
	(func (export "addTwo") (param i32 i32) (result i32)
		local.get 0
		local.get 1
		i32.add)
	(func (export "subTwo") (param i32 i32) (result i32 i32)
		local.get 0
		local.get 1
		i32.sub)
	(func (export "mulTwo") (param i32 i32) (result i32)
		local.get 0
		local.get 1
		i32.mul)
	(export "getAnswer" (func $getAnswer)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type i32 = number & Record<never, never>;
		type Imports = {};
		type Exports = {
			addTwo(p0: i32, p1: i32): i32;
			subTwo(p0: i32, p1: i32): [i32, i32];
			mulTwo(p0: i32, p1: i32): i32;
			getAnswer(): i32;
		};
		"
	`);
});

test("memory import", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "env" "memory" (memory 1)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {
			env: {
				memory: WebAssembly.Memory;
			};
		};
		type Exports = {};
		"
	`);
});

test("memory export", async () => {
	const wasm = await wat2wasm(`\
(module
	(memory 1)
	(export "memory" (memory 0)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {};
		type Exports = {
			memory: WebAssembly.Memory;
		};
		"
	`);
});

test("global import", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "env" "global" (global i32)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {
			env: {
				global: WebAssembly.Global;
			};
		};
		type Exports = {};
		"
	`);
});

test("global export", async () => {
	const wasm = await wat2wasm(`\
(module
	(global (export "global") i32 (i32.const 42)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {};
		type Exports = {
			global: WebAssembly.Global;
		};
		"
	`);
});

test("table import", async () => {
	const wasm = await wat2wasm(`\
(module
	(import "env" "table" (table 1 funcref)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {
			env: {
				table: WebAssembly.Table;
			};
		};
		type Exports = {};
		"
	`);
});

test("table export", async () => {
	const wasm = await wat2wasm(`\
(module
	(table 1 funcref)
	(export "table" (table 0)))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {};
		type Exports = {
			table: WebAssembly.Table;
		};
		"
	`);
});

test("emit instantiate function", async () => {
	const wasm = await wat2wasm("(module)");
	const actual = generateWasmTypes(wasm);
	expect(actual).toMatchInlineSnapshot(`
		"// Generated by wasm-typegen
		type Imports = {};
		type Exports = {};
		type WebAssemblyInstantiatedSource = WebAssembly.WebAssemblyInstantiatedSource & {
			instance: { exports: Exports };
		};
		export function instantiate(bytes: BufferSource, importObject?: Imports): Promise<WebAssemblyInstantiatedSource>;
		export function instantiate(moduleObject: WebAssembly.Module, importObject?: Imports): Promise<WebAssembly.Instance & { exports: Exports }>;
		export function instantiate(
			...args: [BufferSource | WebAssembly.Module, Imports?]
		): Promise<WebAssemblyInstantiatedSource | WebAssembly.Instance & { exports: Exports }> {
			return WebAssembly.instantiate(...args) as any;
		}
		export function instantiateStreaming(source: Response | PromiseLike<Response>, importObject?: Imports): Promise<WebAssemblyInstantiatedSource> {
			return WebAssembly.instantiateStreaming(source, importObject) as any;
		}
		"
	`);
});

test("escape identifier", async () => {
	const wasm = await wat2wasm(`\
(module
	(import " " "." (func))
	(func (export "\\"")))`);
	const actual = generateWasmTypes(wasm, opts);
	expect(actual).toMatchInlineSnapshot(`
		"type Imports = {
			[" "]: {
				["."](): void;
			};
		};
		type Exports = {
			["\\""](): void;
		};
		"
	`);
});
