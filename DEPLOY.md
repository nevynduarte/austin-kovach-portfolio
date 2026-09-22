# Free deployment with Cloudflare Pages

Connect this GitHub repository in Cloudflare: Workers & Pages > Create application > Pages > Connect to Git.

- Production branch: main
- Build command: npm run build
- Build output directory: dist
- Root directory: repository root
- Node.js version: 22
- Suggested project name: austin-kovach (availability is checked by Cloudflare)

The project receives a free pages.dev address and automatically builds on subsequent pushes. This is a static site; no API keys, paid AI service, database, or server are needed. The 3D models are prebuilt assets. Choose the Free plan.

The largest asset is the supplied portfolio PDF (23,911,318 bytes), below Pages' 25 MiB per-file limit. Source CAD accuracy and WebGL test limitations are documented in README.md.

DuckDNS documents IPv4, IPv6, and TXT updates, but no CNAME operation. Cloudflare Pages requires a CNAME for an externally managed custom subdomain; use the provided pages.dev hostname initially. No DNS records have been changed.

References:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://www.duckdns.org/spec.jsp
