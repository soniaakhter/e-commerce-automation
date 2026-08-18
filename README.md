# Playwright E-Commerce Automation Testing Framework

A portfolio-ready UI and API test automation framework for the public [Automation Exercise](https://automationexercise.com/) demo application. Built with Playwright Test and TypeScript, it demonstrates maintainable page objects, reusable fixtures, centralized test data, positive and negative scenarios, end-to-end shopping flows, cross-browser execution, reporting, and GitHub Actions CI.

## Features

- Login and logout
- User registration and account cleanup
- Product search and product details
- Cart management
- Checkout and order placement with synthetic payment data
- Contact Us form and file upload
- Email subscription
- API testing for accounts, authentication, products, brands, and search
- Positive, negative, and end-to-end testing
- Chromium, Firefox, and WebKit coverage
- Tag-based smoke and regression suites
- HTML reports, screenshots, traces, and CI failure videos
- GitHub Actions continuous integration

## Tech stack

- Playwright Test
- TypeScript
- Node.js 20+
- npm
- Git
- GitHub Actions
- dotenv for local environment configuration

## Prerequisites

- Node.js 20 or newer
- npm

## Installation

```bash
git clone <repository-url>
cd <repository-folder>
npm ci
npx playwright install
cp .env.example .env
```

Keep real credentials only in the ignored `.env` file. The framework uses safe defaults for the public site, so credentials are optional unless you want to run configured-user login and duplicate-email scenarios.

## Environment setup

| Variable | Required | Purpose |
| --- | --- | --- |
| `BASE_URL` | No | UI host; defaults to `https://automationexercise.com` |
| `API_BASE_URL` | No | API host; defaults to `BASE_URL` |
| `TEST_USER_EMAIL` | For configured-user scenarios | Existing disposable test account email |
| `TEST_USER_PASSWORD` | For valid configured login | Existing disposable test account password |

Never use a personal account, production credential, or real payment information. Payment values in this project are synthetic demo data.

## Running tests

| Command | Purpose |
| --- | --- |
| `npm test` | Run the API suite once and the complete Chromium suite |
| `npm run test:smoke` | Run core `@smoke` coverage in API and Chromium projects |
| `npm run test:regression` | Run core `@regression` coverage in API and Chromium projects |
| `npm run test:api` | Run the request-only API project |
| `npm run test:chromium` | Run the complete Chromium UI project |
| `npm run test:firefox` | Run the complete Firefox UI project |
| `npm run test:webkit` | Run the complete WebKit UI project |
| `npm run test:cross-browser:smoke` | Run `@smoke` coverage in Firefox and WebKit |
| `npm run test:headed` | Run with visible browser windows |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Open Playwright Inspector |
| `npm run test:ci` | Run the API suite once and the complete Chromium suite used by CI |
| `npm run typecheck` | Type-check without emitting files |
| `npm run report` | Open the most recent HTML report |

Tests use `@smoke`, `@regression`, `@negative`, and `@api` tags. Credential-dependent tests skip with an explicit reason when their environment variables are absent.

## Architecture

```text
tests/                  Behavior-focused UI and API specifications
pages/                  Focused page objects and reusable page components
fixtures/               Shared Playwright fixtures and account lifecycle setup
test-data/              Centralized synthetic data and unique-data factories
utils/                  Currency parsing and the thin API request service
config/                 Environment configuration
docs/                   Test strategy and coverage plan
.github/workflows/      GitHub Actions CI workflow
```

Tests own business assertions. Page objects expose stable locators and actions. The API service centralizes endpoint paths and request construction. Checkout tests use API-created disposable users, while Login and Registration tests continue exercising their real UI flows.

## Cross-browser testing

The UI suite is configured for the desktop profiles of:

- Chromium
- Firefox
- WebKit

Run a complete suite in one browser with `npm run test:chromium`, `npm run test:firefox`, or `npm run test:webkit`. CI runs the full Chromium suite and a focused smoke suite in Firefox and WebKit.

## Reports and debugging

The HTML report is written to `playwright-report/`; screenshots, retry traces, and CI failure videos are written to `test-results/`. Both directories are ignored by Git.

```bash
npm run report
npx playwright show-trace test-results/path/to/trace.zip
```

Local runs retain screenshots on failure and traces on the first retry. CI additionally retains failure videos. The target is a public ad-supported site, so traces are especially useful when third-party vignette ads interfere with navigation.

## Adding a test

1. Add reusable non-sensitive values or a generator under `test-data/`.
2. Add or extend a focused page object only when interaction logic is reusable.
3. Keep assertions and expected business behavior in the spec.
4. Tag the test according to purpose rather than adding every tag.
5. Run the specific spec, then type-check and run the relevant smoke/regression command.
6. Ensure any account created by the test is deleted through verified UI or API cleanup.

## GitHub Actions CI

The `Playwright Tests` workflow runs on pushes, pull requests, and manual dispatch. It uses Node.js 20, `npm ci`, minimal read permissions, branch concurrency cancellation, and three jobs:

1. TypeScript quality check
2. API plus complete Chromium suite
3. Firefox and WebKit smoke suite

Configure these GitHub Actions secret names under **Settings → Secrets and variables → Actions** to enable every configured-user scenario:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

Optional non-sensitive repository variables are `BASE_URL` and `API_BASE_URL`. Test jobs upload separate HTML reports and debugging artifacts for 14 days, including on failure.

Run the CI-equivalent sequence locally with:

```bash
npm ci
npx playwright install --with-deps
npm run typecheck
CI=true npm run test:ci
CI=true npm run test:cross-browser:smoke
```

## Known target-site characteristics

- API endpoints commonly return HTTP 200 while reporting logical 4xx/5xx outcomes in a JSON `responseCode` field served as `text/html`.
- Payment fields enforce presence but not card format; tests use dummy values only.
- Contact name, subject, message, and upload are optional; email uses native validation.
- Duplicate subscription requests receive the same success response.
- Third-party vignette advertisements can intermittently interfere with product navigation; retry traces preserve evidence of these external failures.
