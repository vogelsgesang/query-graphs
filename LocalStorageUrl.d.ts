export declare function isLocalStorageURL(url: URL): boolean;
/**
 * Try to replace the URL by a new URL backed by local storage.
 * Return the unmodified original URL on failure.
 */
export declare function createLocalStorageUrlFor(url: URL): Promise<URL>;
export declare function loadLocalStorageURL(url: URL): string;
//# sourceMappingURL=LocalStorageUrl.d.ts.map