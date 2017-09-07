/// <reference types="intern"/>

declare module 'intern/dojo/node!fs' {
	export * from 'fs';
}

declare module 'intern/dojo/node!path' {
	export * from 'path';
}

declare module 'intern/dojo/node!pngjs' {
	export * from 'pngjs';
}

declare module 'intern/lib/util' {
	export function getErrorMessage(error: Error): string;
}

declare module 'intern/dojo/lang' {
	export * from 'dojo/lang';
}
