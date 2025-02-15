import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { parseArgs } from "node:util";
import { generateWasmTypes } from "./index.js";

const { values } = parseArgs({
	options: {
		help: {
			type: "boolean",
			short: "h",
		},
		wasm: {
			type: "string",
			short: "w",
		},
		out: {
			type: "string",
			short: "o",
		},
		indent: {
			type: "string",
			short: "i",
		},
		newline: {
			type: "string",
			short: "n",
		},
		banner: {
			type: "string",
			short: "b",
		},
		noEmitInstantiateFunc: {
			type: "boolean",
		},
		preferInterface: {
			type: "boolean",
		},
	},
});
if (values.help || !values.wasm) {
	console.log("Usage: wasm-typegen -w <wasm-file> [-o <output-file>]");
	process.exit(0);
}
const wasmPath = path.resolve(values.wasm);
const wasmBuf = fs.readFileSync(wasmPath);
const types = generateWasmTypes(wasmBuf, {
	indent: resolveIndent(values.indent),
	newline: values.newline === "crlf" ? "\r\n" : "\n",
	banner: values.banner,
	noEmitInstantiateFunc: values.noEmitInstantiateFunc,
	preferInterface: values.preferInterface,
});
if (values.out) {
	const outPath = path.resolve(values.out);
	fs.writeFileSync(outPath, types);
} else {
	console.log(types);
}

function resolveIndent(indent: string | undefined): string | undefined {
	if (indent === undefined || indent === "tab") {
		return undefined;
	}
	const maybeNum = Number(indent);
	if (Number.isSafeInteger(maybeNum)) {
		return " ".repeat(maybeNum);
	}
	return indent;
}
