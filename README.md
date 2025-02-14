# wasm-typegen

Generate TypeScript types from WebAssembly module.

## Usage

```sh
npx wasm-typegen -w path/to/your.wasm -o path/to/output.ts
```

or programmatically:

```ts
import * as fs from "node:fs";
import { generateWasmTypes } from "wasm-typegen";
const wasm = await fetch("path/to/your.wasm").then((res) => res.arrayBuffer());
const ts = await generateWasmTypes(wasm, { /* options */ });
fs.writeFileSync("path/to/output.ts", ts);
```

### Options

- `--newline`: Newline character. Default is `"\n"`.
- `--indent`: Indent character. Default is `"\t"`.

## License

MIT
