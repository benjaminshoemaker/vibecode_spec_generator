export const runtime = 'edge';

// Add new license keys here as customers purchase
const VALID_LICENSES = [
  'VIBE-TEST-A3F2-9K1L', // Test key
  // Add customer keys here as they purchase
  // 'VIBE-XXXX-XXXX-XXXX', // customer@email.com - purchased 2025-11-18
];

// License key format: VIBE-XXXX-XXXX-XXXX (4 groups of 4 alphanumeric chars)
const LICENSE_PATTERN = /^VIBE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== 'string') {
      return Response.json(
        { valid: false, error: 'License key is required' },
        { status: 400 }
      );
    }

    // Normalize to uppercase for comparison
    const normalizedKey = licenseKey.toUpperCase().trim();

    // Validate format
    if (!LICENSE_PATTERN.test(normalizedKey)) {
      return Response.json(
        { valid: false, error: 'Invalid license key format' },
        { status: 400 }
      );
    }

    // Check if license exists
    if (VALID_LICENSES.includes(normalizedKey)) {
      return Response.json({ valid: true, plan: 'pro' });
    }

    return Response.json(
      { valid: false, error: 'License key not found' },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
