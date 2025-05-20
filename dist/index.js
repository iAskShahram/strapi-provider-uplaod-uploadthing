'use strict';

var server = require('uploadthing/server');

var index = {
    init: (providerOptions)=>{
        const utapi = new server.UTApi({
            token: providerOptions.token || process.env.UPLOADTHING_TOKEN
        });
        return {
            upload: async (file)=>{
                try {
                    if (!file.buffer) {
                        throw new Error("No file buffer provided");
                    }
                    const toUploadFile = new globalThis.File([
                        file.buffer
                    ], file.name, {
                        type: file.mime
                    });
                    const [uploadThingResponse] = await utapi.uploadFiles([
                        toUploadFile
                    ]);
                    if (!uploadThingResponse.data) {
                        throw new Error("No uploadThingResponse data");
                    } else {
                        /**
             ** uploadThingResponse.data.url && uploadThingResponse.data.appUrl are deprecated
             */ file.url = uploadThingResponse.data.ufsUrl;
                        file.hash = uploadThingResponse.data.key;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    console.error(`🚀 ~ upload error: ${errorMessage}`);
                    return null;
                }
            },
            uploadStream: async (file)=>{
                try {
                    if (!file.stream) {
                        throw new Error("No file stream provided");
                    }
                    const chunks = [];
                    for await (const chunk of file.stream){
                        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    }
                    const buffer = Buffer.concat(chunks);
                    const toUploadFile = new globalThis.File([
                        buffer
                    ], file.name, {
                        type: file.mime
                    });
                    const uploadedFile = await utapi.uploadFiles([
                        toUploadFile
                    ]);
                    if (!uploadedFile[0].data) {
                        throw new Error("No uploadedFile data");
                    }
                    file.url = uploadedFile[0].data.ufsUrl;
                    file.hash = uploadedFile[0].data.key;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    console.error(`🚀 ~ uploadStream error: ${errorMessage}`);
                    return null;
                }
            },
            delete: async (file)=>{
                try {
                    const fileKey = file.hash;
                    if (!fileKey) {
                        throw new Error("No file key provided for deletion");
                    }
                    await utapi.deleteFiles([
                        fileKey
                    ]);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    console.log(`🚀 ~ Could not delete file from UploadThing: ${errorMessage}`);
                    return null;
                }
            }
        };
    }
};

module.exports = index;
//# sourceMappingURL=index.js.map
