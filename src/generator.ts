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
} from "./ast.js";
import { indent, toArrayBuffer } from "./utils.js";

export type Options = {
	/** @default '\t' */
	indent?: string | number;
	/** @default '\n' */
	newline?: "\n" | "\r\n";
};
export class WasmTypesGenerator {
	readonly #importModuleMap = new Map<string, ModuleImport[]>();
	readonly #exportNodes: ModuleExport[] = [];
	readonly #funcNodes: (Func | FuncImportDescr)[] = [];
	readonly #valtypeUsed = {
		i32: false,
		i64: false,
		f32: false,
		f64: false,
	};

	constructor(
		private buf: BufferSource,
		private opts: Options = {},
	) {
		const ast = decode(toArrayBuffer(this.buf), {
			ignoreDataSection: true,
			ignoreCodeSection: true,
		});
		traverse(ast, {
			ModuleExport: (path) => {
				this.#exportNodes.push(path.node);
			},
			ModuleImport: (path) => {
				const module = path.node.module;
				const inModules = this.#importModuleMap.get(module);
				if (inModules) {
					inModules.push(path.node);
				} else {
					this.#importModuleMap.set(module, [path.node]);
				}
			},
			Func: (path) => {
				this.#funcNodes.push(path.node);
			},
			FuncImportDescr: (path) => {
				this.#funcNodes.push(path.node);
			},
		});
	}
	get #indent(): string {
		if (this.opts.indent === undefined) return "\t";
		if (typeof this.opts.indent === "number")
			return " ".repeat(this.opts.indent);
		return this.opts.indent;
	}
	get #newline(): "\n" | "\r\n" {
		return this.opts.newline ?? "\n";
	}

	generate(): string {
		const stmts = [];
		stmts.push(
			this.#block(
				"type Imports = ",
				Array.from(this.#importModuleMap.entries(), ([module, imports]) => {
					return this.#block(
						`${module}: `,
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
										const { params, results } = importNode.descr.signature;
										const paramsStr = this.#paramsToString(params);
										const resultsStr = this.#resultsToString(results);
										return `${importNode.name}(${paramsStr}): ${resultsStr};`;
									}
								}
							})
							.join(this.#newline),
						";",
					);
				}).join(this.#newline),
				";",
			),
		);

		stmts.push(
			this.#block(
				"type Exports = ",
				this.#exportNodes
					.map((exportNode) => {
						switch (exportNode.descr.exportType) {
							case "Memory":
								return `${exportNode.name}: WebAssembly.Memory;`;
							case "Global":
								return `${exportNode.name}: WebAssembly.Global;`;
							case "Table":
								return `${exportNode.name}: WebAssembly.Table;`;
							case "Func": {
								const { params, results } =
									WasmTypesGenerator.#resolveSignature(
										exportNode.descr.id,
										this.#funcNodes,
									);
								const paramsStr = this.#paramsToString(params);
								const resultsStr = this.#resultsToString(results);
								return `${exportNode.name}(${paramsStr}): ${resultsStr};`;
							}
						}
					})
					.join(this.#newline),
				";",
			),
		);

		if (this.#valtypeUsed.i32)
			stmts.unshift("type i32 = number & Record<never, never>;");
		if (this.#valtypeUsed.i64)
			stmts.unshift("type i64 = bigint & Record<never, never>;");
		if (this.#valtypeUsed.f32)
			stmts.unshift("type f32 = number & Record<never, never>;");
		if (this.#valtypeUsed.f64)
			stmts.unshift("type f64 = number & Record<never, never>;");

		return stmts.join(this.#newline) + this.#newline;
	}

	#valtype(valtype: string): string {
		switch (valtype) {
			case "i32":
			case "i64":
			case "f32":
			case "f64":
				this.#valtypeUsed[valtype] = true;
				return valtype;
			default:
				return "any";
		}
	}

	#block(prefix = "", str = "", suffix = ""): string {
		if (str === "") return `${prefix}{}${suffix}`;
		return [
			`${prefix}{`,
			indent(str, this.#indent, this.#newline),
			`}${suffix}`,
		].join(this.#newline);
	}

	#paramsToString(params: Array<{ valtype: string }>): string {
		if (params.length === 0) return "";
		return params
			.map((p, i) => `p${i}: ${this.#valtype(p.valtype)}`)
			.join(", ");
	}
	#resultsToString(results: Array<string>): string {
		if (results.length === 0) {
			return "void";
		}
		if (results.length === 1) {
			return this.#valtype(results[0]);
		}
		return `[${results.map(this.#valtype.bind(this)).join(", ")}]`;
	}
	static #resolveSignature(
		id: NumberLiteral | Identifier,
		funcNodes: (Func | FuncImportDescr)[],
	): Signature {
		if (id.type === "NumberLiteral")
			return WasmTypesGenerator.#resolveFuncSignature(
				funcNodes[id.value],
				funcNodes,
			);
		const node = funcNodes.find((node) => {
			if (node.type !== "Func") return false;
			return node.name?.value === id.value;
		});
		if (!node) throw new Error(`Function not found: ${id.value}`);
		return WasmTypesGenerator.#resolveFuncSignature(node, funcNodes);
	}
	static #resolveFuncSignature(
		node: Func | FuncImportDescr,
		funcNodes: (Func | FuncImportDescr)[],
	): Signature {
		if (node.type === "FuncImportDescr") return node.signature;
		if (node.signature.type === "Signature") return node.signature;
		return WasmTypesGenerator.#resolveSignature(node.signature, funcNodes);
	}
}
