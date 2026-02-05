# PDF Streaming Guide

This guide explains how to use and maintain the permanent PDF link system on `musclepals.com`.

## 1. How it Works

Instead of redirecting users to a temporary S3 URL (which looks like `s3.bucket.com/...` and expires), we use a **Proxy Stream**:

1.  **URL**: The user visits `musclepals.com/file/[token]`.
2.  **Validation**: Our server verifies the `token` exists in the `Orders` database.
3.  **Fetch**: Our server fetches the file from Hetzner S3 in the background.
4.  **Stream**: The file is piped directly to the user's browser.

**Benefits:**
-   Professional URL (`musclepals.com`)
-   No expiration (token is permanent)
-   S3 infrastructure is hidden

## 2. Linking to PDFs

### In Emails or UI
You can now provide a direct link to the user's PDF using the `pdfToken` stored in the `orders` table:

```html
<a href="https://musclepals.com/file/{{pdfToken}}">View your PDF</a>
```

## 3. Configuration & Maintenance

### S3 Credentials
Ensure your credentials are correctly set in `config/credentials.ts`. The implementation uses the `@aws-sdk/client-s3` compatible with Hetzner.

### File Mapping
The mapping between your product (`OrderItem`) and the actual file in S3 is managed in:
`app/file/[token]/route.ts`

Look for the `ORDER_ITEM_FILES` object:

```typescript
const ORDER_ITEM_FILES: Record<string, string> = {
    workout_solo: 'workout_solo.pdf',         // Map to S3 Key
    workout_bundle: 'workout_bundle.pdf',
    // ...
};
```

If you add a new product or change a filename in S3, update this mapping.

## 4. Troubleshooting

-   **404 Not Found**: Either the token is invalid/missing in the database, or the file mapping is incorrect.
-   **500 Internal Error**: Usually indicates a configuration issue (missing S3 credentials) or a connection problem with the S3 provider. Check server logs for "S3 Fetch Error".

## 5. Implementation Details

-   **Route Handler**: `app/file/[token]/route.ts`
-   **Database**: `prisma/schema.prisma` -> `Orders.pdfToken`
-   **Generation**: Token is generated automatically in payment notify routes (`lib/stripe/orderProcessor.ts`, etc.) during order creation.
