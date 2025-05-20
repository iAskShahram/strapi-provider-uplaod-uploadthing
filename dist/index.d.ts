import type { ReadStream } from "node:fs";
interface ProviderOptions {
    token?: string;
}
interface File {
    name: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext?: string;
    mime: string;
    size: number;
    sizeInBytes: number;
    url: string;
    previewUrl?: string;
    path?: string;
    provider?: string;
    provider_metadata?: Record<string, unknown>;
    stream?: ReadStream;
    buffer?: Buffer;
}
interface StrapiUploadProviderMethods {
    upload(file: File): Promise<void | null>;
    uploadStream(file: File): Promise<void | null>;
    delete(file: File): Promise<void | null>;
}
declare const _default: {
    init: (providerOptions: ProviderOptions) => StrapiUploadProviderMethods;
};
export default _default;
//# sourceMappingURL=index.d.ts.map