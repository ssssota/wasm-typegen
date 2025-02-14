declare module "@webassemblyjs/ast" {
	type Node = import("./ast.ts").Node_;
	type TraverseCallback = (type: string, path: NodePath<Node>) => void;

	type NodePathContext<T> = {
		node: T;
		inList: boolean;
		shouldStop: boolean;
		parentPath?: NodePath<Node>;
		parentKey?: string;
	};

	type NodePathMatcher = (path: NodePath<Node>) => boolean | undefined;
	type NodeLocator = (matcher: NodePathMatcher) => Node | undefined;

	type NodePathOperations = {
		findParent: NodeLocator;
		replaceWith: (node: Node) => void;
		remove: () => void;
		insertBefore: (node: Node) => void;
		insertAfter: (node: Node) => void;
		stop: () => void;
	};

	type NodePath<T> = NodePathContext<T> & NodePathOperations;
	export function traverse(
		ast: Node,
		visitor: {
			[N in Node["type"]]?: (
				path: NodePath<Extract<Node, { type: N }>>,
			) => void;
		},
	): void;
}
declare module "@webassemblyjs/wasm-parser" {
	type DecoderOpts = Partial<{
		dump: boolean;
		ignoreDataSection: boolean;
		ignoreCodeSection: boolean;
		ignoreCustomNameSection: boolean;
		errorOnUnknownSection: boolean;
	}>;
	export function decode(
		buffer: ArrayBuffer | SharedArrayBuffer,
		options?: DecoderOpts,
	): import("./ast.ts").Program;
}
