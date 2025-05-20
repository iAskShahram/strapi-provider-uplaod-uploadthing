import type { ReadStream } from "node:fs";
import { UTApi } from "uploadthing/server";

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

export default {
  init: (providerOptions: ProviderOptions): StrapiUploadProviderMethods => {
    const utapi = new UTApi({
      token: providerOptions.token || process.env.UPLOADTHING_TOKEN,
    });

    return {
      upload: async (file: File): Promise<void | null> => {
        try {
          if (!file.buffer) {
            throw new Error("No file buffer provided");
          }

          const toUploadFile = new globalThis.File([file.buffer], file.name, {
            type: file.mime,
          });

          const [uploadThingResponse] = await utapi.uploadFiles([toUploadFile]);
          if (!uploadThingResponse.data) {
            throw new Error("No uploadThingResponse data");
          } else {
            /**
             ** uploadThingResponse.data.url && uploadThingResponse.data.appUrl are deprecated
             */
            file.url = uploadThingResponse.data.ufsUrl;
            file.hash = uploadThingResponse.data.key;
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`🚀 ~ upload error: ${errorMessage}`);
          return null;
        }
      },

      uploadStream: async (file: File): Promise<void | null> => {
        try {
          if (!file.stream) {
            throw new Error("No file stream provided");
          }

          const chunks = [];
          for await (const chunk of file.stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const buffer = Buffer.concat(chunks);

          const toUploadFile = new globalThis.File([buffer], file.name, {
            type: file.mime,
          });

          const uploadedFile = await utapi.uploadFiles([toUploadFile]);
          if (!uploadedFile[0].data) {
            throw new Error("No uploadedFile data");
          }
          file.url = uploadedFile[0].data.ufsUrl;
          file.hash = uploadedFile[0].data.key;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`🚀 ~ uploadStream error: ${errorMessage}`);
          return null;
        }
      },

      delete: async (file: File): Promise<void | null> => {
        try {
          const fileKey = file.hash;
          if (!fileKey) {
            throw new Error("No file key provided for deletion");
          }

          await utapi.deleteFiles([fileKey]);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.log(
            `🚀 ~ Could not delete file from UploadThing: ${errorMessage}`
          );
          return null;
        }
      },
    };
  },
};
