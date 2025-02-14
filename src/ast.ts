export type Maybe<T> = T | null;
export type Byte = number & Record<never, never>;
export type SectionName =
	| "custom"
	| "type"
	| "import"
	| "func"
	| "table"
	| "memory"
	| "global"
	| "export"
	| "start"
	| "element"
	| "code"
	| "data";
export type U32Literal = NumberLiteral;
export type Typeidx = U32Literal;
export type Funcidx = U32Literal;
export type Tableidx = U32Literal;
export type Memidx = U32Literal;
export type Globalidx = U32Literal;
export type Localidx = U32Literal;
export type Labelidx = U32Literal;
export type Index =
	| Typeidx
	| Funcidx
	| Tableidx
	| Memidx
	| Globalidx
	| Localidx
	| Labelidx
	| Identifier; // WAST shorthand
export type SignatureOrTypeRef = Index | Signature;
export type Valtype = "i32" | "i64" | "f32" | "f64" | "u32" | "label";
export type Mutability = "const" | "var";
export type TableElementType = "anyfunc";
export type LongNumber = {
	high: number;
	low: number;
};
export type FuncParam = {
	id?: string;
	valtype: Valtype;
};
export type ExportDescrType = "Func" | "Table" | "Memory" | "Global";
export type Node_ =
	| Module
	| ModuleMetadata
	| ModuleNameMetadata
	| FunctionNameMetadata
	| LocalNameMetadata
	| BinaryModule
	| QuoteModule
	| SectionMetadata
	| ProducersSectionMetadata
	| ProducerMetadata
	| ProducerMetadataVersionedName
	| LoopInstruction
	| Instr
	| IfInstruction
	| StringLiteral
	| NumberLiteral
	| LongNumberLiteral
	| FloatLiteral
	| Elem
	| IndexInFuncSection
	| ValtypeLiteral
	| TypeInstruction
	| Start
	| GlobalType
	| LeadingComment
	| BlockComment
	| Data
	| Global_
	| Table
	| Memory
	| FuncImportDescr
	| ModuleImport
	| ModuleExportDescr
	| ModuleExport
	| Limit
	| Signature
	| Program
	| Identifier
	| BlockInstruction
	| CallInstruction
	| CallIndirectInstruction
	| ByteArray
	| Func
	| InternalBrUnless
	| InternalGoto
	| InternalCallExtern
	| InternalEndAndReturn;
export type Block = LoopInstruction | BlockInstruction | Func;
export type Instruction =
	| LoopInstruction
	| Instr
	| IfInstruction
	| TypeInstruction
	| BlockInstruction
	| CallInstruction
	| CallIndirectInstruction;
export type Expression =
	| Instr
	| StringLiteral
	| NumberLiteral
	| LongNumberLiteral
	| FloatLiteral
	| ValtypeLiteral
	| Identifier;
export type NumericLiteral = NumberLiteral | LongNumberLiteral | FloatLiteral;
export type ImportDescr = GlobalType | Table | Memory | FuncImportDescr;
export type Intrinsics =
	| InternalBrUnless
	| InternalGoto
	| InternalCallExtern
	| InternalEndAndReturn;
export type Module = {
	type: "Module";
	id: Maybe<string>;
	fields: Node_[];
	metadata?: ModuleMetadata;
};
export type ModuleMetadata = {
	type: "ModuleMetadata";
	sections: SectionMetadata[];
	functionNames?: FunctionNameMetadata[];
	localNames?: ModuleMetadata[];
	producers?: ProducersSectionMetadata[];
};
export type ModuleNameMetadata = {
	type: "ModuleNameMetadata";
	value: string;
};
export type FunctionNameMetadata = {
	type: "FunctionNameMetadata";
	value: string;
	index: number;
};
export type LocalNameMetadata = {
	type: "LocalNameMetadata";
	value: string;
	localIndex: number;
	functionIndex: number;
};
export type BinaryModule = {
	type: "BinaryModule";
	id: Maybe<string>;
	blob: string[];
};
export type QuoteModule = {
	type: "QuoteModule";
	id: Maybe<string>;
	string: string[];
};
export type SectionMetadata = {
	type: "SectionMetadata";
	section: SectionName;
	startOffset: number;
	size: NumberLiteral;
	/** Size of the vector in the section (if any) */
	vectorOfSize: NumberLiteral;
};
export type ProducersSectionMetadata = {
	type: "ProducersSectionMetadata";
	producers: ProducerMetadata[];
};
export type ProducerMetadata = {
	type: "ProducerMetadata";
	language: ProducerMetadataVersionedName[];
	processedBy: ProducerMetadataVersionedName[];
	sdk: ProducerMetadataVersionedName[];
};
export type ProducerMetadataVersionedName = {
	type: "ProducerMetadataVersionedName";
	name: string;
	version: string;
};
// Instructions
export type LoopInstruction = {
	type: "LoopInstruction";
	id: "loop";
	label: Maybe<Identifier>;
	resulttype: Maybe<Valtype>;
	instr: Instruction[];
};
export type Instr = {
	type: "Instr";
	id: string;
	object?: Valtype;
	args: Expression[];
	namedArgs?: Record<string, unknown>;
};
export type IfInstruction = {
	type: "IfInstruction";
	id: "if";
	/** only for WAST */
	testLabel: Identifier;
	test: Instruction[];
	result: Maybe<Valtype>;
	consequent: Instruction[];
	alternate: Instruction[];
};
// Concrete value types
export type StringLiteral = {
	type: "StringLiteral";
	value: string;
};
export type NumberLiteral = {
	type: "NumberLiteral";
	value: number;
	raw: string;
};
export type LongNumberLiteral = {
	type: "LongNumberLiteral";
	value: LongNumber;
	raw: string;
};
export type FloatLiteral = {
	type: "FloatLiteral";
	value: number;
	nan?: boolean;
	inf?: boolean;
	raw: string;
};
export type Elem = {
	type: "Elem";
	table: Index;
	offset: Instruction[];
	funcs: Index[];
};
export type IndexInFuncSection = {
	type: "IndexInFuncSection";
	index: Index;
};
export type ValtypeLiteral = {
	type: "ValtypeLiteral";
	name: Valtype;
};
export type TypeInstruction = {
	type: "TypeInstruction";
	id: Maybe<Index>;
	functype: Signature;
};
export type Start = {
	type: "Start";
	index: Index;
};
export type GlobalType = {
	type: "GlobalType";
	valtype: Valtype;
	mutability: Mutability;
};
export type LeadingComment = {
	type: "LeadingComment";
	value: string;
};
export type BlockComment = {
	type: "BlockComment";
	value: string;
};
export type Data = {
	type: "Data";
	memoryIndex: Memidx;
	offset: Instruction;
	init: ByteArray;
};
export type Global_ = {
	type: "Global";
	globalType: GlobalType;
	init: Instruction[];
	name: Maybe<Identifier>;
};
export type Table = {
	type: "Table";
	elementType: TableElementType;
	limits: Limit;
	name: Maybe<Identifier>;
	elements?: Index[];
};
export type Memory = {
	type: "Memory";
	limits: Limit;
	id: Maybe<Index>;
};
export type FuncImportDescr = {
	type: "FuncImportDescr";
	id: Identifier;
	signature: Signature;
};
export type ModuleImport = {
	type: "ModuleImport";
	module: string;
	name: string;
	descr: ImportDescr;
};
export type ModuleExportDescr = {
	type: "ModuleExportDescr";
	exportType: ExportDescrType;
	id: Index;
};
export type ModuleExport = {
	type: "ModuleExport";
	name: string;
	descr: ModuleExportDescr;
};
export type Limit = {
	type: "Limit";
	min: number;
	max?: number;
	// Threads proposal, shared memory
	shared?: boolean;
};
export type Signature = {
	type: "Signature";
	params: FuncParam[];
	results: Valtype[];
};
export type Program = {
	type: "Program";
	body: Node_[];
};
export type Identifier = {
	type: "Identifier";
	value: string;
	raw?: string;
};
export type BlockInstruction = {
	type: "BlockInstruction";
	id: "block";
	label: Maybe<Identifier>;
	instr: Instruction[];
	result: Maybe<Valtype>;
};
export type CallInstruction = {
	type: "CallInstruction";
	id: "call";
	index: Index;
	instrArgs?: Expression[];
	numeric?: IndexInFuncSection;
};
export type CallIndirectInstruction = {
	type: "CallIndirectInstruction";
	id: "call_indirect";
	signature: SignatureOrTypeRef;
	instr?: Expression[];
};
export type ByteArray = {
	type: "ByteArray";
	values: Byte[];
};
export type Func = {
	type: "Func";
	name: Maybe<Index>;
	signature: SignatureOrTypeRef;
	body: Instruction[];
	/** means that it has been imported from the outside js */
	isExternal?: boolean;
	metadata?: FunctionNameMetadata;
};
// Intrinsics
export type InternalBrUnless = {
	type: "InternalBrUnless";
	target: number;
};
export type InternalGoto = {
	type: "InternalGoto";
	target: number;
};
export type InternalCallExtern = {
	type: "InternalCallExtern";
	target: number;
};
// function bodies are terminated by an `end` instruction but are missing a
// return instruction
//
// Since we can't inject a new instruction we are injecting a new instruction.
export type InternalEndAndReturn = {
	type: "InternalEndAndReturn";
};
