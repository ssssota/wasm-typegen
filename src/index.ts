import { traverse } from "@webassemblyjs/ast";
import { decode } from "@webassemblyjs/wasm-parser";
import type {
	Func,
	FuncImportDescr,
	Identifier,
	ModuleExport,
	ModuleImport,
	NumberLiteral,
	Signature,
} from "./ast.ts";

const decodeOptions = /** @type {const} */ ({
	ignoreCodeSection: true,
	ignoreDataSection: true,
});

/**
 * @param {BufferSource} buf WebAssembly binary
 * @returns {string} TypeScript code.
 */
export function generateWasmModuleType(buf: BufferSource): string {
	const ast = decode(toArrayBuffer(buf), decodeOptions);
	const importModuleMap = new Map<string, ModuleImport[]>();
	const exportNodes: ModuleExport[] = [];
	const funcNodes: (Func | FuncImportDescr)[] = [];
	traverse(ast, {
		ModuleExport(path) {
			exportNodes.push(path.node);
		},
		ModuleImport(path) {
			const module = path.node.module;
			const inModules = importModuleMap.get(module);
			if (inModules) {
				inModules.push(path.node);
			} else {
				importModuleMap.set(module, [path.node]);
			}
		},
		Func(path) {
			funcNodes.push(path.node);
		},
		FuncImportDescr(path) {
			funcNodes.push(path.node);
		},
	});

	let ret = `\
type i32 = number & Record<never, never>;
type i64 = bigint & Record<never, never>;
type f32 = number & Record<never, never>;
type f64 = number & Record<never, never>;
`;
	ret += block(
		Array.from(importModuleMap.entries(), ([module, imports]) => {
			return block(
				imports
					.map((importNode) => {
						switch (importNode.descr.type) {
							case "Memory":
								return `${importNode.name}: WebAssembly.Memory;`;
							case "GlobalType":
								return `${importNode.name}: WebAssembly.Global;`;
							case "Table":
								return `${importNode.name}: WebAssembly.Table;`;
							case "FuncImportDescr": {
								const paramsStr = paramsToString(
									importNode.descr.signature.params,
								);
								const resultsStr = resultsToString(
									importNode.descr.signature.results,
								);
								return `${importNode.name}(${paramsStr}): ${resultsStr};`;
							}
						}
					})
					.join("\n"),
				`${module}: `,
				";",
			);
		}).join("\n"),
		"type Imports = ",
		";\n",
	);

	ret += block(
		exportNodes
			.map((exportNode) => {
				switch (exportNode.descr.exportType) {
					case "Memory":
						return `${exportNode.name}: WebAssembly.Memory;`;
					case "Global":
						return `${exportNode.name}: WebAssembly.Global;`;
					case "Table":
						return `${exportNode.name}: WebAssembly.Table;`;
					case "Func": {
						const signature = resolveSignature(exportNode.descr.id, funcNodes);
						const paramsStr = paramsToString(signature.params);
						const resultsStr = resultsToString(signature.results);
						return `${exportNode.name}(${paramsStr}): ${resultsStr};`;
					}
				}
			})
			.join("\n"),
		"type Exports = ",
		";\n",
	);

	return ret;
}

function paramsToString(params: Array<{ valtype: string }>): string {
	if (params.length === 0) return "";
	return params.map((p, i) => `p${i}: ${p.valtype}`).join(", ");
}
function resultsToString(results: Array<string>): string {
	if (results.length === 0) {
		return "void";
	}
	if (results.length === 1) {
		return results[0];
	}
	return `[${results.join(", ")}]`;
}
function block(str = "", prefix = "", suffix = ""): string {
	if (str === "") return `${prefix}{}${suffix}`;
	return `${prefix}{\n${indent(str)}\n}${suffix}`;
}
function indent(str: string, space = "\t"): string {
	return str
		.split("\n")
		.map((line) => space + line)
		.join("\n");
}
function resolveSignature(
	id: NumberLiteral | Identifier,
	funcNodes: (Func | FuncImportDescr)[],
): Signature {
	if (id.type === "NumberLiteral")
		return resolveFuncSignature(funcNodes[id.value], funcNodes);
	const node = funcNodes.find((node) => {
		if (node.type !== "Func") return false;
		return node.name?.value === id.value;
	});
	if (!node) throw new Error(`Function not found: ${id.value}`);
	return resolveFuncSignature(node, funcNodes);
}
function resolveFuncSignature(
	node: Func | FuncImportDescr,
	funcNodes: (Func | FuncImportDescr)[],
): Signature {
	if (node.type === "FuncImportDescr") return node.signature;
	if (node.signature.type === "Signature") return node.signature;
	return resolveSignature(node.signature, funcNodes);
}
function toArrayBuffer(buf: BufferSource): SharedArrayBuffer | ArrayBuffer {
	if (buf instanceof ArrayBuffer) return buf;
	return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
