import { useSignal, useSignalEffect } from "@preact/signals";
import type { ChangeEvent } from "preact/compat";
import { useCallback, useEffect } from "preact/hooks";
import { type Options, generateWasmTypes } from "wasm-typegen";
import sampleWasmUrl from "./sample.wasm?url";

const navItems = [
	{ name: "GitHub", url: "https://github.com/ssssota/wasm-typegen" },
	{ name: "npm", url: "https://www.npmjs.com/package/wasm-typegen" },
];
const indentOptions = [
	["\t", "tab"],
	["  ", "2-space"],
	["    ", "4-space"],
] as const satisfies [string, string][];

export function App() {
	const wasm$ = useSignal<ArrayBuffer>();
	const ts$ = useSignal<string>();
	const banner$ = useSignal<string>();
	const indent$ = useSignal<string>("\t");
	const onChangeIndentRadio = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			indent$.value = e.currentTarget.value;
		},
		[indent$],
	);
	const interface$ = useSignal(false);
	const func$ = useSignal(true);
	useSignalEffect(() => {
		if (!wasm$.value) return;
		const options = {
			banner: banner$.value || undefined,
			indent: indent$.value,
			preferInterface: interface$.value,
			noEmitInstantiateFunc: !func$.value,
		} as const satisfies Options;
		try {
			ts$.value = generateWasmTypes(wasm$.value, options);
		} catch (e) {
			ts$.value = `/* GenerateTimeError: ${e} */`;
		}
	});
	useEffect(() => {
		fetch(sampleWasmUrl)
			.then((res) => res.arrayBuffer())
			.then((buf) => {
				wasm$.value = buf;
			});
	}, [wasm$]);

	return (
		<>
			<header>
				<h1>wasm-typegen</h1>
				<p>Generate TypeScript type definitions from WebAssembly module.</p>
				<nav style={{ display: "flex", gap: "1em" }}>
					{navItems.map((item) => (
						<a key={item.url} href={item.url} target="_blank" rel="noreferrer">
							{item.name}
						</a>
					))}
				</nav>
			</header>
			<main>
				<form>
					<p>
						<label>
							WebAssembly file:
							<input
								type="file"
								onChange={(e) => {
									const file = e.currentTarget.files?.[0];
									if (!file) return;
									readFileAsArrayBuffer(file)
										.then((buf) => {
											wasm$.value = buf;
										})
										.catch((e) => {
											ts$.value = `/* ReadFileError: ${e} */`;
										});
								}}
							/>
						</label>
					</p>
					<p>
						<label>
							Banner:
							<input
								type="text"
								value={banner$}
								onInput={(e) => {
									banner$.value = e.currentTarget.value;
								}}
							/>
						</label>
					</p>
					<fieldset>
						<legend>Indent</legend>
						{indentOptions.map(([indent, label]) => (
							<label key={indent}>
								<input
									type="radio"
									name="indent"
									onChange={onChangeIndentRadio}
									checked={indent$.value === indent}
									value={indent}
								/>{" "}
								{label}
							</label>
						))}
					</fieldset>
					<p>
						<label>
							Use interface(preferInterface):
							<input
								type="checkbox"
								checked={interface$}
								onChange={(e) => {
									interface$.value = e.currentTarget.checked;
								}}
							/>
						</label>
					</p>
					<p>
						<label>
							Emit functions(!noEmitInstantiateFunc):
							<input
								type="checkbox"
								checked={func$}
								onChange={(e) => {
									func$.value = e.currentTarget.checked;
								}}
							/>
						</label>
					</p>
				</form>
				<pre>↓↓↓</pre>
				<output>
					<pre>
						<code>{ts$}</code>
					</pre>
				</output>
			</main>
		</>
	);
}

function readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (result instanceof ArrayBuffer) {
				resolve(result);
			} else {
				reject(new Error("Failed to read file as ArrayBuffer."));
			}
		};
		reader.readAsArrayBuffer(file);
	});
}
