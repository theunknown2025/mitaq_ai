# Tawtik Automation Service

This service automates interactions with the Tawtik.ma website for client registration and file creation.

## Setup

1. Install the required dependencies:
   ```
   npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
   ```

2. Make sure your .env file includes the following variables:
   ```
   NODE_ENV=development
   BACKEND_URL=http://localhost:5000
   ```

## How It Works

The Tawtik automation service uses Puppeteer to:

1. Navigate to the Tawtik.ma website
2. Log in with provided credentials
3. Navigate to the ANEL section
4. Create a new file (Nouveau Dossier)
5. Fill in the dossier number and other details
6. Save the dossier

## Usage

From your frontend, call the API to start the automation:

```typescript
import { createTawtikFile } from '@/services/tawtikService';

// Call the Tawtik service
const result = await createTawtikFile(clientId, dossierNumber, clientInfo);

if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

## Security Considerations

- The service uses real credentials to access the Tawtik system.
- In production, consider storing credentials in environment variables rather than hardcoding them.
- The puppeteer-extra-plugin-stealth is used to avoid detection as an automated tool.

## Troubleshooting

If you encounter issues:

1. Try running in non-headless mode during development by setting NODE_ENV=development
2. Check the console logs for detailed error messages
3. Ensure the Tawtik website structure hasn't changed, which would require updating the selectors