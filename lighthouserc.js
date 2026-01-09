/**
 * Lighthouse CI Configuration
 * Monitors performance, accessibility, best practices, and SEO
 * https://github.com/GoogleChrome/lighthouse-ci
 */
module.exports = {
  ci: {
    collect: {
      // Use the built static files
      staticDistDir: './public',
      // Pages to audit
      url: ['http://localhost/index.html', 'http://localhost/about/index.html'],
      // Number of runs per URL (for consistency)
      numberOfRuns: 3,
    },
    assert: {
      // Assertions - fail CI if scores drop below thresholds
      assertions: {
        // Performance (Gatsby sites should be fast!)
        'categories:performance': ['error', { minScore: 0.9 }],
        // Accessibility (important for art portfolio)
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // Specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Image optimization (critical for art portfolio)
        'uses-webp-images': 'off', // Gatsby handles this
        'uses-responsive-images': 'warn',
        'unsized-images': 'error',
      },
    },
    upload: {
      // Upload to temporary public storage (free)
      target: 'temporary-public-storage',
    },
  },
}
