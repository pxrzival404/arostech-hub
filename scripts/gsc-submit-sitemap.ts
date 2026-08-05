import crypto from 'crypto';

const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.info(JSON.stringify({ level: 'info', message, ...meta }));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error instanceof Error ? error.message : error }));
  }
};

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

// Target domains and their respective sitemaps
const SUBMISSIONS = [
  // 1. Domain Property Submission (covers all subdomains)
  {
    siteUrl: 'sc-domain:sentradaya.com',
    sitemaps: [
      'https://sentradaya.com/sitemap.xml',
      'https://pju.sentradaya.com/sitemap.xml',
      'https://solarcell.sentradaya.com/sitemap.xml',
      'https://alatpetir.sentradaya.com/sitemap.xml',
      'https://baterai.sentradaya.com/sitemap.xml'
    ]
  },
  // 2. Individual URL-prefix fallbacks for granular control
  {
    siteUrl: 'https://sentradaya.com/',
    sitemaps: ['https://sentradaya.com/sitemap.xml']
  },
  {
    siteUrl: 'https://pju.sentradaya.com/',
    sitemaps: ['https://pju.sentradaya.com/sitemap.xml']
  },
  {
    siteUrl: 'https://solarcell.sentradaya.com/',
    sitemaps: ['https://solarcell.sentradaya.com/sitemap.xml']
  },
  {
    siteUrl: 'https://alatpetir.sentradaya.com/',
    sitemaps: ['https://alatpetir.sentradaya.com/sitemap.xml']
  },
  {
    siteUrl: 'https://baterai.sentradaya.com/',
    sitemaps: ['https://baterai.sentradaya.com/sitemap.xml']
  }
];

// Helper to convert buffers or strings to base64url format
function base64url(str: string | Buffer): string {
  const base64 = typeof str === 'string' ? Buffer.from(str).toString('base64') : str.toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Signs a JWT assertion and exchanges it for a Google OAuth2 access token
 */
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    exp,
    iat
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaimSet = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  // Sign using Node's native crypto module
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(serviceAccount.private_key);
  const encodedSignature = base64url(signature);

  const jwt = `${signatureInput}.${encodedSignature}`;

  const response = await fetch(serviceAccount.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain Google access token: ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Submits a sitemap URL to the Google Search Console API for a specific property
 */
async function submitSitemap(siteUrl: string, sitemapUrl: string, accessToken: string): Promise<boolean> {
  const apiEndpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  const response = await fetch(apiEndpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Length': '0' // Endpoint expects a PUT request with no body, but Content-Length header is good practice
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`Failed to submit sitemap "${sitemapUrl}" to site "${siteUrl}"`, {
      status: response.status,
      statusText: response.statusText,
      errorDetails: errorText,
    });
    return false;
  }

  logger.info(`Successfully submitted sitemap "${sitemapUrl}" to site "${siteUrl}"`);
  return true;
}

/**
 * Main script execution
 */
async function main() {
  const credentialsJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const isForceDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

  let serviceAccount: ServiceAccount | null = null;
  let isDryRun = isForceDryRun;

  logger.info('Google Search Console Sitemap Submitter starting...');

  if (!credentialsJson) {
    logger.warn('No GSC_SERVICE_ACCOUNT_JSON found in environment. Running in DRY-RUN mode.');
    isDryRun = true;
  } else {
    try {
      serviceAccount = JSON.parse(credentialsJson) as ServiceAccount;
      
      // Basic checks to detect mock credentials
      if (
        !serviceAccount.client_email || 
        !serviceAccount.private_key || 
        serviceAccount.client_email.includes('your_') || 
        serviceAccount.private_key.includes('mock') || 
        serviceAccount.private_key === 'mock'
      ) {
        logger.warn('Detected mock or incomplete service account credentials. Running in DRY-RUN mode.');
        isDryRun = true;
      }
    } catch (e) {
      logger.error('Failed to parse GSC_SERVICE_ACCOUNT_JSON environment variable. Running in DRY-RUN mode.', e);
      isDryRun = true;
    }
  }

  if (isDryRun) {
    logger.info('Running dry-run submission summary', {
      serviceAccountEmail: serviceAccount?.client_email || 'mock-service-account@gserviceaccount.com',
      submissionsCount: SUBMISSIONS.reduce((sum, item) => sum + item.sitemaps.length, 0),
    });
    return;
  }

  if (!serviceAccount) {
    logger.error('Service account configuration is unexpectedly null. Aborting.');
    process.exit(1);
  }

  try {
    logger.info(`Authenticating service account: ${serviceAccount.client_email}...`);
    const accessToken = await getAccessToken(serviceAccount);
    logger.info('Authentication successful! Beginning sitemap submissions...');

    let successCount = 0;
    let failCount = 0;

    for (const item of SUBMISSIONS) {
      for (const sitemap of item.sitemaps) {
        const success = await submitSitemap(item.siteUrl, sitemap, accessToken);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }

    logger.info('Sitemap submission completed', {
      successes: successCount,
      failures: failCount,
    });

    if (failCount > 0) {
      logger.info('Note: Failures are common if GSC properties are not verified yet or permissions are missing.');
    }
  } catch (error) {
    logger.error('Fatal error during sitemap submission process', error);
    process.exit(1);
  }
}

main();
