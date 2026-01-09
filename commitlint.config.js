/**
 * Commitlint configuration
 * Enforces conventional commit messages
 * https://www.conventionalcommits.org/
 *
 * Format: <type>(<scope>): <subject>
 *
 * Examples:
 *   feat: add new gallery filter
 *   fix: resolve image loading issue
 *   docs: update README
 *   perf(build): optimize image processing
 *   deps: update gatsby to v5.14
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting (no code change)
        'refactor', // Code restructuring
        'perf', // Performance improvement
        'test', // Adding tests
        'build', // Build system changes
        'ci', // CI configuration
        'chore', // Maintenance
        'revert', // Revert previous commit
        'deps', // Dependency updates
      ],
    ],
    // Subject should not be empty
    'subject-empty': [2, 'never'],
    // Type should not be empty
    'type-empty': [2, 'never'],
    // Subject should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // No period at end of subject
    'subject-full-stop': [2, 'never', '.'],
    // Max header length
    'header-max-length': [2, 'always', 72],
  },
}
