# APEX-F1 — SEO & Metadata Policy

**Status: Phase 2 Frozen**

## 1. Metadata Standards

- **Title**: Must follow `[Page Name] | APEX F1`. Max 60 characters.
- **Description**: Must be specific to the page. Max 160 characters.
- **Canonical URLs**: Every page must define a canonical URL to prevent duplicate content issues.

## 2. Dynamic Route SEO
- Pages for Drivers, Teams, and Races **must** use `generateMetadata()`.
- Use API data to populate titles (e.g., `Max Verstappen - Profile | APEX F1`).

## 3. OpenGraph & Social
- **OG Image**: Every major landing page must have a high-fidelity social share image.
- **Twitter Card**: Set to `summary_large_image` for all pages.
- **Alt Text**: All images must have descriptive alt text for search engine indexing and accessibility.

## 4. Hierarchy
- Every page must have exactly one `<h1>`.
- Use semantic HTML tags (`<article>`, `<section>`, `<nav>`) to help search engines understand structure.
