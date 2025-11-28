export interface SpecMetadata {
  appName: string | null;
  problem: string | null;
  idealUser: string | null;
  platform: string | null;
  techStack: string[];
  integrationCount: number;
  complexityTier: "simple" | "moderate" | "complex";
}

const TECH_KEYWORDS = [
  "React",
  "React Native",
  "Next.js",
  "Next",
  "Vue",
  "Angular",
  "Svelte",
  "Node.js",
  "Node",
  "Express",
  "Nest",
  "NestJS",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby",
  "Rails",
  "Go",
  "Golang",
  "Rust",
  "Java",
  "Spring",
  "Kotlin",
  "Swift",
  "Flutter",
  "PostgreSQL",
  "Postgres",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "DynamoDB",
  "AWS",
  "Supabase",
  "Firebase",
  "Vercel",
  "Netlify",
  "Cloudflare",
  "TypeScript",
  "JavaScript",
  "GraphQL",
  "REST",
  "Docker",
  "Kubernetes",
  "Terraform",
  "S3",
  "Lambda",
  "Tailwind",
  "CSS",
  "SCSS",
];

const INTEGRATION_KEYWORDS = [
  "Auth0",
  "Cognito",
  "Clerk",
  "Stripe",
  "PayPal",
  "Twilio",
  "SendGrid",
  "Mailchimp",
  "Segment",
  "Amplitude",
  "Mixpanel",
  "Google Analytics",
  "Sentry",
  "Datadog",
  "Slack",
  "Discord",
  "Zapier",
  "OpenAI",
  "Anthropic",
  "API Gateway",
  "OAuth",
  "SSO",
  "APNs",
  "FCM",
  "push notification",
  "webhook",
  "third-party",
  "integration",
  "DocuSign",
  "HelloSign",
  "Plaid",
  "HealthKit",
  "Google Fit",
];

function extractSection(content: string, headerPattern: RegExp): string | null {
  const lines = content.split("\n");
  let inSection = false;
  let sectionContent: string[] = [];

  for (const line of lines) {
    if (headerPattern.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      // Stop at next header (## or #)
      if (/^#{1,2}\s/.test(line)) {
        break;
      }
      sectionContent.push(line);
    }
  }

  const text = sectionContent.join("\n").trim();
  return text || null;
}

function extractFirst150Chars(text: string | null): string | null {
  if (!text) return null;
  // Remove markdown formatting, collapse whitespace
  const cleaned = text
    .replace(/[#*_`\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= 150) return cleaned;
  return cleaned.slice(0, 147) + "...";
}

function extractAppName(onePager: string): string | null {
  // Look for "# One-Pager — App Name" or "# App Name"
  const match = onePager.match(/^#\s+(?:One-Pager\s*[—–-]\s*)?(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return null;
}

function extractPlatform(onePager: string): string | null {
  const section = extractSection(onePager, /^##\s*Platform/i);
  if (!section) return null;

  const platforms: string[] = [];
  const lowerSection = section.toLowerCase();

  if (lowerSection.includes("ios") || lowerSection.includes("iphone") || lowerSection.includes("ipad")) {
    platforms.push("iOS");
  }
  if (lowerSection.includes("android")) {
    platforms.push("Android");
  }
  if (lowerSection.includes("web") || lowerSection.includes("browser")) {
    platforms.push("Web");
  }
  if (lowerSection.includes("desktop")) {
    platforms.push("Desktop");
  }
  if (lowerSection.includes("mobile-first") || lowerSection.includes("mobile first")) {
    if (!platforms.includes("iOS") && !platforms.includes("Android")) {
      platforms.push("Mobile");
    }
  }
  if (
    lowerSection.includes("cross-platform") ||
    lowerSection.includes("react native") ||
    lowerSection.includes("flutter")
  ) {
    if (!platforms.includes("iOS") && !platforms.includes("Android")) {
      platforms.push("Cross-platform");
    }
  }

  return platforms.length > 0 ? platforms.join(", ") : null;
}

function extractTechStack(devSpec: string): string[] {
  const found = new Set<string>();

  for (const tech of TECH_KEYWORDS) {
    // Case-insensitive search with word boundaries
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(devSpec)) {
      found.add(tech);
    }
  }

  return Array.from(found).slice(0, 15); // Limit to 15 items
}

function countIntegrations(devSpec: string): number {
  let count = 0;
  const lowerSpec = devSpec.toLowerCase();

  for (const keyword of INTEGRATION_KEYWORDS) {
    if (lowerSpec.includes(keyword.toLowerCase())) {
      count++;
    }
  }

  return count;
}

function computeComplexityTier(
  devSpec: string,
  integrationCount: number
): "simple" | "moderate" | "complex" {
  const wordCount = devSpec.split(/\s+/).length;

  if (wordCount > 4000 || integrationCount > 6) {
    return "complex";
  }
  if (wordCount < 1500 && integrationCount < 3) {
    return "simple";
  }
  return "moderate";
}

export function parseSpecMetadata(
  onePager: string | null,
  devSpec: string | null
): SpecMetadata {
  const result: SpecMetadata = {
    appName: null,
    problem: null,
    idealUser: null,
    platform: null,
    techStack: [],
    integrationCount: 0,
    complexityTier: "moderate",
  };

  if (onePager) {
    try {
      result.appName = extractAppName(onePager);

      const problemSection = extractSection(onePager, /^##\s*Problem\s*Statement/i);
      result.problem = extractFirst150Chars(problemSection);

      const audienceSection = extractSection(
        onePager,
        /^##\s*Target\s*Audience|^##\s*Ideal\s*Customer/i
      );
      result.idealUser = extractFirst150Chars(audienceSection);

      result.platform = extractPlatform(onePager);
    } catch {
      // Parsing failed, leave nulls
    }
  }

  if (devSpec) {
    try {
      result.techStack = extractTechStack(devSpec);
      result.integrationCount = countIntegrations(devSpec);
      result.complexityTier = computeComplexityTier(devSpec, result.integrationCount);
    } catch {
      // Parsing failed, leave defaults
    }
  }

  return result;
}
