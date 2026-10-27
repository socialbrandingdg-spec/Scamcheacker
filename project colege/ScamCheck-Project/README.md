# ScamCheck

ScamCheck is a responsive web app that analyzes suspicious SMS, WhatsApp messages and emails for common scam indicators.

## Features

- Risk score from 0–100
- High / Medium / Low risk classification
- Detection of urgency, prize scams, OTP requests, payment requests, KYC threats, links, impersonation and credential requests
- Practical safety recommendations
- Recent analysis history using browser localStorage
- Responsive mobile-first interface
- No login required
- No backend required for the demo

## Run locally

1. Download or clone the project.
2. Open the folder in VS Code.
3. Open `index.html` in a browser.

For a better development workflow, install the VS Code **Live Server** extension and choose **Open with Live Server**.

## Project structure

```text
scamcheck/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Important

This is an educational risk indicator, not a guarantee that a message is safe or fraudulent. The current version uses client-side heuristic rules. A production version should add a secure backend, URL reputation checks, phishing intelligence sources, rate limiting, logging controls and stronger validation.

## Future roadmap

- React frontend
- FastAPI backend
- User accounts
- Secure URL/domain analysis
- Threat-intelligence API integration
- AI-assisted explanation
- Community reports
- Admin dashboard
- PWA/mobile support
