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

export default {
  init: (providerOptions: ProviderOptions) => {
    const utapi = new UTApi({
      token: providerOptions.token || process.env.UPLOADTHING_TOKEN,
    });

    return {
      upload: async (file: File) => {
        try {
          if (!file.buffer) {
            throw new Error("No file buffer provided");
          }

          const toUploadFile = new File([file.buffer], file.name, {
            type: file.mime,
          });

          const [uploadThingResponse] = await utapi.uploadFiles([toUploadFile]);
          if (!uploadThingResponse.data) {
            file.url = "";
            return file;
          }

          /**
           ** uploadThingResponse.data.url && uploadThingResponse.data.appUrl are deprecated
           */
          file.url = uploadThingResponse.data.ufsUrl;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`🚀 ~ ${errorMessage}`);
          return null;
        }
      },

      delete: async (file: File) => {
        try {
          const fileKey = file.provider_metadata?.fileKey;
          if (!fileKey) {
            throw new Error("No file key provided for deletion");
          }

          await utapi.deleteFiles([fileKey as string]);
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
