export function toArrayBuffer(
	buf: BufferSource,
): SharedArrayBuffer | ArrayBuffer {
	if (buf instanceof ArrayBuffer) return buf;
	return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export function indent(str: string, indent = "\t", newline = "\n"): string {
	return str
		.split(newline)
		.map((line) => indent + line)
		.join(newline);
}
