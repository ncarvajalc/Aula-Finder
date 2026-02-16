# Security Policy

## Supported Versions

We release security updates for the following versions of Aula-Finder:

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |

## Reporting a Vulnerability

The Aula-Finder team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them by:

1. **Opening a security advisory** in GitHub: Go to the [Security Advisories page](https://github.com/Open-Source-Uniandes/Aula-Finder/security/advisories/new) and create a new advisory.

2. **Sending an email** to the maintainers: If you prefer, you can also send an email to the project maintainers listed in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 72 hours.
- **Updates**: We will send you regular updates about our progress addressing the issue.
- **Disclosure**: Once the vulnerability is fixed, we will publicly disclose it (with credit to you, if desired).

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our service
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report the vulnerability promptly
- Keep the vulnerability confidential until it has been resolved

## Security Best Practices for Contributors

When contributing to Aula-Finder:

- **Never commit secrets** such as API keys, passwords, or tokens to the repository
- **Review dependencies** for known vulnerabilities using `npm audit`
- **Follow secure coding practices** as outlined in [CONTRIBUTING.md](CONTRIBUTING.md)
- **Use environment variables** for sensitive configuration
- **Sanitize user inputs** to prevent injection attacks

## Data Privacy

Aula-Finder:

- Does not collect personal information from users
- Uses publicly available course data from the Universidad de los Andes API
- Operates as a client-side application with no backend database
- Does not store cookies or track user behavior

For questions about data privacy, please review our [README.md](README.md) or contact the maintainers.

## Third-Party Dependencies

We regularly monitor and update our dependencies to address known security vulnerabilities. You can check the current status of our dependencies by running:

```bash
npm audit
```

If you discover a vulnerability in one of our dependencies, please report it following the process above.

---

Thank you for helping keep Aula-Finder and its users safe! 💛
