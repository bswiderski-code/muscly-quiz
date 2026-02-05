# PDF Streaming Guide

This guide explains how to use and maintain the permanent PDF link system on `musclepals.com`.

## 1. How it Works

Instead of redirecting users to a temporary S3 URL (which looks like `s3.bucket.com/...` and expires), we use a **Proxy Stream**:

1.  **URL**: The user visits `musclepals.com/files/[token]`.
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
<a href="https://musclepals.com/files/{{pdfToken}}">View your PDF</a>
```

## 3. Configuration & Maintenance

### S3 Credentials
Ensure your credentials are correctly set in `config/credentials.ts`. The implementation uses the `@aws-sdk/client-s3` compatible with Hetzner.

### S3 Key Structure
The system automatically organizes files in S3 based on product type and user location:

**Pattern:** `[category]/[country]/[localized_name]_[order_id].pdf`

**Categories:**
- `training-plan/` (for workout and calisthenics)
- `diet/` (for BMI reports)

**Example (Poland, Workout):**
`training-plan/PL/Plan_treningowy_1234.pdf`

**Example (US, BMI Report):**
`diet/US/BMI_Report_5678.pdf`

## 4. Troubleshooting

-   **404 Not Found**: Either the token is invalid/missing in the database, or the file mapping is incorrect.
-   **500 Internal Error**: Usually indicates a configuration issue (missing S3 credentials) or a connection problem with the S3 provider. Check server logs for "S3 Fetch Error".

## 5. Implementation Details

-   **Route Handler**: `app/files/[token]/route.ts`
-   **Database**: `prisma/schema.prisma` -> `Orders.pdfToken`
-   **Generation**: Token is generated automatically in payment notify routes (`lib/stripe/orderProcessor.ts`, etc.) during order creation.
