# @iaskshahram/strapi-provider-upload-uploadthing


A Strapi custom upload provider to integrate [UploadThing](https://uploadthing.com) for storing your media files.

## Quick Setup Guide

#### 1. Add Environment Variable

Add your UploadThing toekn to the `.env` file in your Strapi project's root:

```env
# .env
UPLOADTHING_TOKEN="your_uploadthing_token"
```
*(You can find this key in your [UploadThing Dashboard](https://uploadthing.com/dashboard).)*

#### 2. Configure Strapi Plugins

Update your `config/plugins.ts|js` file:

```typescript
// path: config/plugins.ts
export default ({ env }) => ({
  // ... any other plugin configurations
  upload: {
    config: {
      provider: "@iaskshahram/strapi-provider-upload-uploadthing",
      providerOptions: {
        // This will use the UPLOADTHING_TOKEN from your .env file.
        // It fallbacks to process.env.UPLOADTHING_TOKEN if not defined here.
        token: env("UPLOADTHING_TOKEN"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
});
```

#### 3. Configure Strapi Middlewares (Content Security Policy)

Update your `config/middlewares.ts` (or `config/middlewares.js`) file to allow connections to UploadThing:

```typescript
// path: config/middlewares.ts
export default [
  // ...other middlewares
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": [
            "'self'",
            "https:",
            "https://uploadthing.com",
            "https://*.uploadthing.com",
            "https://*.ufs.sh",
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "your-endpoint.ufs.sh", // IMPORTANT: REPLACE THIS! (e.g., "app-id.ufs.sh")
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "your-endpoint.ufs.sh", // IMPORTANT: REPLACE THIS! (e.g., "app-id.ufs.sh")
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];
```
**Important:** In the `img-src` and `media-src` directives, replace `"your-endpoint.ufs.sh"` with your actual UploadThing file URL hostname (e.g., `[your-app-id].ufs.sh`).

You're good to go now.

##### <u>Connect with me on [X/Twitter](https://x.com/iAskShahram)</u>

## Table of Contents

- [Quick Setup Guide](#quick-setup-guide)
  - [1. Add Environment Variable](#1-add-environment-variable)
  - [2. Configure Strapi Plugins](#2-configure-strapi-plugins)
  - [3. Configure Strapi Middlewares](#3-configure-strapi-middlewares)
- [Detailed Information](#detailed-information)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Detailed Configuration Explanation](#detailed-configuration-explanation)
    - [Environment Variables](#environment-variables)
    - [Plugin Configuration Details](#plugin-configuration-details)
    - [Middleware Configuration Details (CSP)](#middleware-configuration-details-csp)
- [Usage](#usage)
- [Node.js Version Support](#nodejs-version-support)
- [Contributing](#contributing)
- [License](#license)

## Detailed Information

### Features

- Upload files from your Strapi application to UploadThing.
- Delete files from UploadThing through Strapi's media library.

### Prerequisites

- A Strapi project (v4 or later)
- An account with [UploadThing](https://uploadthing.com)
- Your `UPLOADTHING_TOKEN`

### Installation

Install the provider:

```bash
pnpm install @iaskshahram/strapi-provider-upload-uploadthing
```

### Detailed Configuration Explanation

This section provides more context on the settings shown in the Quick Setup Guide.

#### Environment Variables

Add your UploadThing token to the `.env` file in the root of your Strapi project. You can find this key in your [UploadThing Dashboard](https://uploadthing.com/dashboard).

```env
# .env
UPLOADTHING_TOKEN="your_uploadthing_token"
```

**Note:** The provider can also directly accept the token via `providerOptions.token` in the plugin configuration, but using an environment variable is recommended for security and flexibility. The provider's `init` function will prioritize `providerOptions.token` if set, then fallback to `process.env.UPLOADTHING_TOKEN`.

#### Plugin Configuration Details

Modify (or create) the `config/plugins.ts|js` file in your Strapi project to tell Strapi to use UploadThing as the upload provider.

```typescript
// path: config/plugins.ts
export default ({ env }) => ({
  // ... any other plugin configurations
  upload: {
    config: {
      provider: "@iaskshahram/strapi-provider-upload-uploadthing",
      providerOptions: {
        // override the below `UPLOADTHING_TOKEN` as defined in your .env file.
        // it fallbacks to process.env.UPLOADTHING_TOKEN
        token: env("UPLOADTHING_TOKEN"),
      },
      actionOptions: {
        // These actionOptions are not currently used by this provider for custom parameters
        // but are part of the standard Strapi upload provider configuration structure.
        upload: {},
        delete: {},
      },
    },
  },
  // ... any other plugin configurations
});
```

#### Middleware Configuration Details (CSP)

To ensure that your Strapi application can load images and media from UploadThing, you need to update your Content Security Policy (CSP) in the `config/middlewares.ts|js` file.

**Important:** Replace `"your-endpoint.ufs.sh"` with your actual UploadThing file URL hostname. This is typically in the format `[your-app-id].ufs.sh` or a newer format like `*.utfs.io`. You can find the correct domain for your uploaded files by inspecting the URL of a file uploaded via UploadThing.

```typescript
// path: config/middlewares.ts
export default [
  // ...other middlewares (ensure this list is correctly ordered as per Strapi's requirements)
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": [
            "'self'",
            "https:",
            "https://uploadthing.com",      // For UploadThing API calls
            "https://*.uploadthing.com",    // For UploadThing related services
            "https://*.ufs.sh",             // General UploadThing file storage domain
            "https://*.utfs.io",            // Newer general UploadThing file storage domain
            // Add your specific UploadThing endpoint if known and different
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "your-endpoint.ufs.sh", // REPLACE THIS with your actual UploadThing file domain
            // Example: "app-id.ufs.sh" or "*.utfs.io"
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "your-endpoint.ufs.sh", // REPLACE THIS with your actual UploadThing file domain
            // Example: "app-id.ufs.sh" or "*.utfs.io"
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...other middlewares
];
```
**Explanation of CSP Directives:**
-   `connect-src`: Allows connections to UploadThing's API and file services.
-   `img-src`: Allows images to be loaded from your UploadThing storage.
-   `media-src`: Allows media (like videos) to be loaded from your UploadThing storage.
-   `your-endpoint.ufs.sh` (or `*.utfs.io`): This is a placeholder. **You MUST replace this** with the domain from which your UploadThing files are served. If you're unsure, upload a test file and check its URL.

### Usage

Once configured, Strapi will automatically use the UploadThing provider for all file uploads via the Media Library or any content types that use file/image fields.

-   **Uploading Files**: When you upload a file in Strapi, it will be sent to your UploadThing account.
-   **Deleting Files**: When you delete a file from Strapi's Media Library, it will also be deleted from your UploadThing account.

### Node.js Version Support

This package is compatible with the following Node.js versions (as specified in `package.json`):
-   `>=18.0.0 <=22.x.x`

### Contributing

Contributions are welcome! Please feel free to submit issues and pull requests to the [GitHub repository](https://github.com/iAskShahram/strapi-provider-upload-uploadthing).

### License

See the [LICENSE](LICENSE) file for details.