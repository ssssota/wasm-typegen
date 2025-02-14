import { useState } from "preact/hooks";
import { generateWasmTypes } from "../../dist";

const navItems = [
	{ name: "GitHub", url: "https://github.com/ssssota/wasm-typegen" },
	{ name: "npm", url: "https://www.npmjs.com/package/wasm-typegen" },
];
export function App() {
	const [typeDef, setTypeDef] = useState("Put your wasm file.");

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
				<input
					type="file"
					onChange={(e) => {
						const file = e.currentTarget.files?.item(0);
						if (!file) return;
						const reader = new FileReader();
						reader.onload = async () => {
							try {
								const buffer = reader.result as ArrayBuffer;
								setTypeDef(generateWasmTypes(buffer));
							} catch (error) {
								setTypeDef(`${error}`);
							}
						};
						reader.readAsArrayBuffer(file);
					}}
				/>
				<pre>↓↓↓</pre>
				<output>
					<pre>
						<code>{typeDef}</code>
					</pre>
				</output>
			</main>
		</>
	);
}
