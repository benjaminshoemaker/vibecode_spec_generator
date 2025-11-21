# Deployment Guide

## Quick Summary

Your app is now ready for deployment with the following enhancements:

✅ **SEO Optimized** - Meta tags, Open Graph, Twitter Cards
✅ **Google Analytics Ready** - GA4 tracking configured
✅ **Professional Footer** - With feedback link, social links, and legal pages
✅ **All Tests Passing** - 73/73 tests green
✅ **Production Build Working** - Successfully compiles

## Environment Variables Required

### For Development (.env.local)
```bash
OPENAI_API_KEY=sk-...           # Required
OPENAI_MODEL=gpt-4o             # Optional, defaults to gpt-4o
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Optional, for analytics
```

### For Production (Vercel/Netlify/etc.)
Add these environment variables in your hosting platform:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

**Optional:**
- `OPENAI_MODEL` - Default model (gpt-4o if not set)
- `NEXT_PUBLIC_GA_ID` - Google Analytics measurement ID

## Google Analytics Setup

1. Go to https://analytics.google.com/
2. Create a new GA4 property
3. Get your measurement ID (format: `G-XXXXXXXXXX`)
4. Add to `.env.local` or hosting platform environment variables
5. The tracking code will automatically be injected when `NEXT_PUBLIC_GA_ID` is set

## Footer Customization

The footer includes a placeholder for your feedback link. Update it in:
`/app/components/Footer.tsx`

Find and replace:
```tsx
href="FEEDBACK_LINK_PLACEHOLDER"
```

With your actual feedback form URL (e.g., Typeform, Google Form, Tally, etc.)

### Other Placeholders to Update:
- **GitHub URL**: Line 58 - Update `https://github.com/yourusername/vibe-scaffold`
- **Documentation URL**: Line 65 - Update `https://docs.example.com`
- **Twitter Handle**: Line 132 - Update `https://twitter.com/yourhandle`
- **GitHub Profile**: Line 142 - Update `https://github.com/yourusername`

## Deploy to Vercel (Recommended - 5 minutes)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com/
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - (Optional) Add: `NEXT_PUBLIC_GA_ID`
   - Click "Deploy"

3. **Set Usage Limits** (Important!):
   - Go to https://platform.openai.com/usage
   - Set a monthly budget limit (start with $20-50)
   - Set up billing alerts

## Deploy to Other Platforms

### Netlify
```bash
netlify deploy --prod
```
Add environment variables in: Site Settings → Environment Variables

### Railway
```bash
railway up
```
Add environment variables in: Variables tab

### AWS Amplify / Render / Fly.io
Follow their Next.js deployment guides and add the environment variables.

## Post-Deployment Checklist

- [ ] Verify the site loads at your production URL
- [ ] Test the wizard flow end-to-end
- [ ] Check OpenAI API calls are working
- [ ] Verify Google Analytics is tracking (check Real-Time reports)
- [ ] Set OpenAI usage limits/alerts
- [ ] Update footer links (feedback, GitHub, social)
- [ ] Test on mobile devices
- [ ] Test in different browsers (Chrome, Safari, Firefox)

## Monitoring Costs

### OpenAI API Usage
- Dashboard: https://platform.openai.com/usage
- **Model costs** (as of 2024):
  - gpt-4o: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
  - gpt-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens

### Average Cost per User Session
Estimate: $0.10 - $0.50 per complete 4-step workflow (with gpt-4o)

**Recommendation**: Start with gpt-4o-mini for cost savings, switch to gpt-4o if quality is needed.

## Rate Limiting (Recommended for Public Beta)

To prevent abuse, consider adding rate limiting. Quick options:

1. **Vercel KV + Upstash Rate Limit**
2. **Cloudflare Workers**
3. **API Key requirement** (simple: require users to bring their own OpenAI key)

## Analytics Events to Track

Consider adding custom events for:
- Step completions
- Document generations
- Downloads (individual + ZIP)
- Errors / API failures
- Load sample docs usage

## Support & Feedback

Users can submit feedback via the footer link (update `FEEDBACK_LINK_PLACEHOLDER`).

Recommended feedback tools:
- **Typeform** (https://typeform.com) - Beautiful forms
- **Tally** (https://tally.so) - Free, simple
- **Google Forms** - Free, basic
- **Canny** (https://canny.io) - Feature requests + voting

## Legal Pages (TODO)

The footer links to Privacy Policy and Terms of Service. You'll need to create:
- `/app/privacy/page.tsx` - Privacy policy
- `/app/terms/page.tsx` - Terms of service

Or use external links to privacy/terms hosted elsewhere.

## Next Steps

1. Deploy to Vercel
2. Add Google Analytics ID
3. Update footer placeholder links
4. Set OpenAI usage limits
5. Share with beta users
6. Monitor costs and usage
7. Iterate based on feedback

## Questions?

Check the README.md for detailed documentation, or open an issue on GitHub.
