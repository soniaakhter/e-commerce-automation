# Automation Exercise — Playwright Automation Test Plan

## 1. Purpose and scope

This document records the broader coverage strategy for `https://automationexercise.com`. The repository implements the core UI and API journeys described here; scenarios marked as recommendations may remain future coverage and should not be read as current automated-test inventory. See `README.md` and `npx playwright test --list` for the executable suite.

In scope: Home, Registration, Login, Logout, Products, Product Search, Product Details, Categories and Brands, Cart, Cart Quantity, Remove from Cart, Checkout, Address Validation, Place Order, Contact Us, Subscription, and the public practice APIs.

Out of scope for the first implementation wave: visual-diff testing, accessibility certification, performance/load testing, third-party advertising behavior, email delivery validation, and real payment-provider integration.

### Inspection basis and limitation

Inspected on 2026-08-16 using the live public HTML and the site's own published specifications:

- `https://automationexercise.com/`
- `https://automationexercise.com/login`
- `https://automationexercise.com/products`
- `https://automationexercise.com/product_details/1`
- `https://automationexercise.com/view_cart`
- `https://automationexercise.com/contact_us`
- `https://automationexercise.com/test_cases`
- `https://automationexercise.com/api_list`

Initial planning began from public HTML and published workflows. Implementation subsequently verified dynamic DOM behavior, browser-native validation, modal timing, authenticated checkout, synthetic payment submission, and disposable account cleanup through executed Playwright tests. Recommendations that are not present under `tests/` remain planning items rather than claimed automation.

## 2. Quality goals

- Protect the revenue-critical journey from account creation or login through order confirmation.
- Verify catalog discovery, pricing, quantities, totals, cart persistence, and address integrity.
- Cover meaningful validation failures without duplicating browser-native behavior excessively.
- Keep tests independent, deterministic, parallel-safe, and able to clean up created accounts.
- Use API setup/cleanup where it shortens UI tests without bypassing the behavior under test.

## 3. Priority and suite definitions

| Label | Meaning |
| --- | --- |
| P0 | Critical path or data-integrity failure that blocks buying or authentication |
| P1 | High-value customer flow or important validation |
| P2 | Medium-value functional, boundary, or resilience coverage |
| P3 | Low-risk presentation or convenience behavior |
| Smoke | Small, fast deployment-confidence suite |
| Regression | Broad functional suite |
| Negative | Invalid input, unsupported action, or denied-state suite |
| E2E | Multi-module business journey |

## 4. Proposed scenario inventory

The inventory contains **87 scenarios**: 22 P0, 36 P1, 25 P2, and 4 P3. Suite tags are additive.

### 4.1 Home Page — 4 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| HOM-01 | P0 | Smoke, Regression | Home loads successfully over HTTPS and shows the main navigation and hero content. |
| HOM-02 | P1 | Smoke, Regression | Products, Cart, Signup/Login, Test Cases, API Testing, and Contact Us navigation opens the expected route. |
| HOM-03 | P2 | Regression | Featured and recommended product cards show name, price, image, Add to cart, and View Product where applicable. |
| HOM-04 | P3 | Regression | Footer, Subscription section, scroll-to-top control, and responsive layout remain usable at supported viewports. |

UI/business validation: unique header navigation, visible categories/brands, non-empty catalog cards, price format `Rs. <number>`, no broken primary navigation. Data/state: anonymous browser; one desktop and one focused mobile viewport check. Reuse: `Header`, `Footer`, `ProductCard`. Risk: carousels, ads, lazy-loaded images, and scroll animations can cause timing noise; assert stable content, not animation position.

### 4.2 Registration — 7 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| REG-01 | P0 | Smoke, Regression | Register a unique user with all required account and address fields; verify account-created state and logged-in username. |
| REG-02 | P1 | Regression | Register with optional company/address2/newsletter/partner selections omitted. |
| REG-03 | P1 | Negative, Regression | Start signup with an already registered email and verify `Email Address already exist!`. |
| REG-04 | P2 | Negative, Regression | Submit each required field empty and verify submission is blocked or a clear validation is shown. |
| REG-05 | P2 | Negative, Regression | Reject malformed email addresses and invalid/empty password according to observed form constraints. |
| REG-06 | P2 | Regression | Validate title, date-of-birth, and country select boundaries (first/last available option and leap-day data if accepted). |
| REG-07 | P2 | Negative, Regression | Exercise field-length and character boundaries for name, address, postcode, city, state, and mobile without server error or truncation corruption. |

UI/business validation: the signup step leads to `ENTER ACCOUNT INFORMATION`; prefilled name/email are correct; account creation is confirmed; the session identifies the new user. Data/state: unique timestamp/UUID email, valid full profile, existing user, boundary and invalid profile variants. Cleanup: delete the generated account through API where possible. Reuse: `SignupPage`, `AccountCreatedPage`, `Header`, user factory. Risk: shared public database, duplicate emails, destructive cleanup, undocumented length rules, and bot/rate limiting.

### 4.3 Login — 6 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| LOG-01 | P0 | Smoke, Regression | Login with a valid active account and verify `Logged in as <username>`. |
| LOG-02 | P0 | Negative, Regression | Login with invalid email/password and verify `Your email or password is incorrect!`. |
| LOG-03 | P1 | Negative, Regression | Valid email with wrong password does not create an authenticated session. |
| LOG-04 | P1 | Negative, Regression | Unknown email with plausible password does not create an authenticated session. |
| LOG-05 | P2 | Negative, Regression | Empty or malformed email and empty password are blocked cleanly. |
| LOG-06 | P2 | Regression | Password remains masked and credentials are not exposed in URL, logs, screenshots, or report attachments. |

UI/business validation: login heading, placeholders, button, exact error state, and authenticated header. Data/state: API-created user for isolation; invalid credentials generated per run. Reuse: `LoginPage`, `Header`, `registeredUser`. Risk: never print secrets; a persistent shared account may be deleted or locked by another runner.

### 4.4 Logout — 3 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| OUT-01 | P0 | Smoke, Regression | Authenticated user logs out and returns to the login page. |
| OUT-02 | P1 | Negative, Regression | After logout, authenticated-only checkout state cannot be reached using browser Back or a direct protected route. |
| OUT-03 | P2 | Regression | Logout removes authenticated header actions while preserving expected anonymous cart behavior. |

State/data: authenticated session with optional cart. Reuse: `Header`, `authenticatedPage`. Risk: session and anonymous-cart persistence must be observed and asserted deliberately rather than assumed.

### 4.5 Products — 5 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| PRD-01 | P0 | Smoke, Regression | All Products page opens and displays a non-empty product list. |
| PRD-02 | P1 | Regression | Product cards expose consistent name, numeric price, image, add-to-cart action, and product-details link. |
| PRD-03 | P1 | Regression | Add a product from the listing and verify the Added modal offers Continue Shopping and View Cart. |
| PRD-04 | P2 | Regression | Add two distinct products and maintain distinct product identity and price. |
| PRD-05 | P3 | Regression | Catalog remains usable when images are slow or unavailable; text/actions remain testable. |

Data/state: known product IDs/names only as controlled references; refresh the catalog through API before relying on a product. Reuse: `ProductsPage`, `ProductCard`, `AddToCartModal`. Risk: duplicate visible card markup (normal and hover overlay) makes broad text locators ambiguous; scope actions to a card keyed by product ID or unique View Product URL.

### 4.6 Product Search — 5 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| SRC-01 | P0 | Smoke, Regression | Search an exact known product and show `SEARCHED PRODUCTS` with the expected item. |
| SRC-02 | P1 | Regression | Partial keyword returns only related products (for example `top`, `tshirt`, or `jean`). |
| SRC-03 | P1 | Negative, Regression | Nonexistent keyword shows a valid empty-result state without stale products. |
| SRC-04 | P2 | Regression | Leading/trailing spaces and case variations behave consistently and do not error. |
| SRC-05 | P2 | Negative, Regression | Empty, very long, and special-character searches do not crash, inject markup, or return stale state. |

Data/state: exact product, partial keyword with multiple matches, no-match token, whitespace/case/long/special variants. Reuse: `ProductsPage`, `ProductCard`. Risk: result matching semantics are undocumented; establish expected API/UI behavior before asserting case or trim rules.

### 4.7 Product Details — 5 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| DET-01 | P0 | Smoke, Regression | Open product ID 1 and verify name, category, price, availability, condition, and brand. |
| DET-02 | P1 | Regression | Add the detailed product to cart with default quantity 1. |
| DET-03 | P1 | Regression | Product identity and price agree between listing, detail, and cart. |
| DET-04 | P2 | Negative, Regression | Invalid/nonexistent product ID returns a controlled error/404 and never another product silently. |
| DET-05 | P2 | Regression | Submit a valid product review and verify `Thank you for your review.`; invalid/empty review behavior is recorded. |

Data/state: stable product ID confirmed via products API, review identity/message. Reuse: `ProductDetailsPage`, `AddToCartModal`. Risk: review submission mutates shared data; use unique text and do not assert ordering/count. Product availability/catalog can change.

### 4.8 Categories and Brands — 4 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| CAT-01 | P1 | Smoke, Regression | Women/Men/Kids groups expand and a subcategory opens the matching category-products page. |
| CAT-02 | P1 | Regression | Switch from one gender/category to another and verify heading and products refresh. |
| CAT-03 | P1 | Regression | Select a brand and verify the brand heading and matching product set. |
| CAT-04 | P2 | Regression | Category/brand results contain only products consistent with API/detail metadata where available. |

Data/state: one category per gender and two brands with products. Reuse: `CatalogSidebar`, `ProductsPage`, product API client. Risk: category headings and route casing may differ; brand counts are live shared data and should not be hard-coded.

### 4.9 Cart — 6 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| CRT-01 | P0 | Smoke, Regression | Add one product, open cart, and verify product, unit price, quantity, and line total. |
| CRT-02 | P0 | Regression | Add multiple products and verify each row and `unit price × quantity = total`. |
| CRT-03 | P1 | Regression | Continue Shopping closes the modal and preserves cart contents. |
| CRT-04 | P1 | E2E, Regression | Products added anonymously remain in cart after login, matching the site's published workflow. |
| CRT-05 | P2 | Regression | Re-adding the same product follows one consistent rule (increment or separate row) and totals remain correct. |
| CRT-06 | P2 | Negative, Regression | Empty cart displays `Cart is empty!` and does not offer an actionable checkout path. |

Data/state: anonymous and authenticated sessions; one and two known products. Reuse: `CartPage`, `ProductCard`, `AddToCartModal`. Risk: cart storage and login merge behavior may depend on cookies/session; each test requires a fresh context unless persistence is the behavior under test.

### 4.10 Cart Quantity — 4 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| QTY-01 | P0 | Smoke, Regression | Set detail-page quantity to 4, add product, and verify exact cart quantity and total. |
| QTY-02 | P1 | Regression | Quantity boundary 1 is accepted and calculated correctly. |
| QTY-03 | P1 | Negative, Regression | Zero, negative, decimal, nonnumeric, empty, and whitespace values are rejected or normalized consistently. |
| QTY-04 | P2 | Negative, Regression | Very large quantity does not overflow, hang, or produce an invalid total. |

Data/state: quantity values `1`, `4`, `0`, `-1`, `1.5`, text, blank, and a safe large value. Reuse: `ProductDetailsPage`, `CartPage`. Risk: HTML number-input browser differences; test the resulting business state, and restrict engine-specific native-validation assertions.

### 4.11 Remove from Cart — 3 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| REM-01 | P0 | Smoke, Regression | Remove one selected row from a multi-product cart; only that product disappears. |
| REM-02 | P1 | Regression | Removing the last product shows the empty-cart state and disables checkout. |
| REM-03 | P2 | Negative, Regression | Rapid/double remove does not error, remove another row, or leave a ghost item. |

Data/state: carts with one and two products. Reuse: `CartPage`. Risk: asynchronous row removal; wait for the targeted row to detach rather than using fixed delays.

### 4.12 Checkout — 6 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| CHK-01 | P0 | Smoke, Regression | Authenticated user with a non-empty cart proceeds to checkout and sees address details and order review. |
| CHK-02 | P0 | Negative, Regression | Anonymous checkout prompts Register/Login and preserves the cart through authentication. |
| CHK-03 | P1 | Negative, Regression | Empty-cart user cannot proceed to checkout. |
| CHK-04 | P1 | Regression | Order-review products, unit prices, quantities, line totals, and aggregate amount match the cart. |
| CHK-05 | P2 | Regression | Order comment accepts normal text and safely handles long/special-character input. |
| CHK-06 | P2 | Negative, Regression | Refresh/back navigation does not duplicate the cart or place an order before confirmation. |

Data/state: authenticated user with full address, anonymous cart, multiple known products, comments. Reuse: `CheckoutPage`, `CartPage`, `authenticatedPage`. Risk: checkout markup is authenticated-only and was not interactively inspected; locators require confirmation.

### 4.13 Address Validation — 4 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| ADR-01 | P0 | E2E, Regression | Delivery address exactly reflects registration data. |
| ADR-02 | P0 | E2E, Regression | Billing address exactly reflects registration data. |
| ADR-03 | P1 | Regression | Optional company/address2 values appear when supplied and do not create blank punctuation when omitted. |
| ADR-04 | P2 | Regression | International country, postcode, spaces, punctuation, and maximum safe field lengths render without corruption. |

Data/state: full address and minimal valid address; country/postcode boundary variants. Normalize whitespace only where the UI intentionally formats it. Reuse: `CheckoutPage`, address assertion helper, user factory. Risk: address labels/line breaks can make whole-block text comparison brittle; assert semantic lines/fields individually.

### 4.14 Place Order — 6 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| ORD-01 | P0 | Smoke, E2E, Regression | Login → add product → checkout → enter payment → confirm → verify successful order message. |
| ORD-02 | P0 | E2E, Regression | Register during checkout, preserve cart, validate address, and place order. |
| ORD-03 | P1 | Negative, Regression | Required payment fields missing or malformed prevent successful confirmation. |
| ORD-04 | P1 | Negative, Regression | Card number/CVC/expiry boundary values are rejected or accepted according to observed rules without exposing card data. |
| ORD-05 | P1 | Regression | Download Invoice after purchase produces a non-empty expected file and Continue returns safely. |
| ORD-06 | P2 | Negative, Regression | Double-click/reload around Pay and Confirm does not create duplicate confirmation or an inconsistent state. |

Data/state: disposable user, known cart, obviously synthetic non-production payment values stored outside test code, valid/invalid boundary sets. Reuse: `PaymentPage`, `OrderConfirmationPage`, download helper. Risk: the site appears to simulate payment; acceptance rules and order persistence require interactive confirmation. Never use real cardholder data. Order submission mutates shared state.

### 4.15 Contact Us — 5 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| CON-01 | P1 | Smoke, Regression | Submit valid name, email, subject, message, and safe attachment; accept confirmation dialog and verify success text. |
| CON-02 | P1 | Negative, Regression | Missing required fields or malformed email are blocked cleanly. |
| CON-03 | P2 | Regression | Submit valid form without optional attachment if supported. |
| CON-04 | P2 | Negative, Regression | Unsupported/oversized file is rejected safely; no executable content is used. |
| CON-05 | P3 | Regression | Home action after success returns to the home page. |

Data/state: unique email, normal and boundary messages, tiny `.txt` fixture, unsupported harmless file. Reuse: `ContactUsPage`, dialog handler, upload fixture. Risk: browser dialog must be registered before submit; server file-size/type limits are undocumented and should be probed conservatively.

### 4.16 Subscription — 4 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| SUB-01 | P1 | Smoke, Regression | Subscribe with valid unique email on Home and verify `You have been successfully subscribed!`. |
| SUB-02 | P1 | Regression | Subscription works from Cart footer as documented. |
| SUB-03 | P2 | Negative, Regression | Empty and malformed email are rejected without success state. |
| SUB-04 | P3 | Negative, Regression | Duplicate, whitespace/case, long, and special-character email variants behave consistently without duplicate UI messages. |

Data/state: unique valid email, malformed/empty/duplicate/boundary variants. Reuse: `Footer`. Risk: subscription creates persistent shared records and may be non-idempotent; use unique addresses and avoid asserting email delivery.

### 4.17 API Endpoints — 10 scenarios

| ID | Pri | Suites | Scenario |
| --- | --- | --- | --- |
| API-01 | P0 | Smoke, Regression | `GET /api/productsList` returns documented success and a parseable non-empty product list. |
| API-02 | P1 | Negative, Regression | Unsupported `POST /api/productsList` returns documented 405 behavior. |
| API-03 | P1 | Smoke, Regression | `GET /api/brandsList` returns documented success and a parseable non-empty brand list. |
| API-04 | P1 | Negative, Regression | Unsupported `PUT /api/brandsList` returns documented 405 behavior. |
| API-05 | P1 | Regression | `POST /api/searchProduct` with known partial keyword returns related products; missing parameter returns documented 400 behavior. |
| API-06 | P0 | Regression | `POST /api/verifyLogin` distinguishes valid (200), invalid (404), missing parameters (400), and unsupported DELETE (405). |
| API-07 | P0 | Regression | `POST /api/createAccount` creates a unique user and exposes no password in response/logs. |
| API-08 | P1 | Regression | `PUT /api/updateAccount` updates the disposable user and subsequent detail lookup reflects the change. |
| API-09 | P1 | Regression | `GET /api/getUserDetailByEmail` returns the correct user; unknown/missing-email behavior is characterized. |
| API-10 | P0 | Regression | `DELETE /api/deleteAccount` removes the disposable user and verification/detail calls no longer treat it as active. |

Data/state: dynamically generated user payloads, known and no-match search terms, wrong methods, missing parameters. Reuse: Playwright `request`, thin `AccountApi` helper only if repetition warrants it. Risk: the published API examples describe a `responseCode` field that may differ from the actual HTTP status; assert both deliberately after observing responses. Account APIs mutate a shared public service and require `try/finally` cleanup.

## 5. Critical P0 scenarios

The 22 P0 scenarios are HOM-01, REG-01, LOG-01, LOG-02, OUT-01, PRD-01, SRC-01, DET-01, CRT-01, CRT-02, QTY-01, REM-01, CHK-01, CHK-02, ADR-01, ADR-02, ORD-01, ORD-02, API-01, API-06, API-07, and API-10.

## 6. Recommended smoke suite

Run on Chromium for every pull request; run all three engines on the main/nightly pipeline:

1. HOM-01 — home availability and shell
2. HOM-02 — primary navigation
3. PRD-01 — catalog availability
4. SRC-01 — exact product search
5. DET-01 — product-details integrity
6. CRT-01 — add and verify cart
7. QTY-01 — quantity propagation
8. REM-01 — remove selected cart item
9. REG-01 — create disposable account
10. LOG-01 — valid login
11. OUT-01 — logout
12. CHK-01 — authenticated checkout entry
13. ORD-01 — one full synthetic order (schedule/nightly if runtime or shared-state cost is high)
14. CON-01 — contact form (schedule/nightly if persistent submissions become noisy)
15. SUB-01 — subscription (schedule/nightly due to persistent data)
16. API-01 and API-03 — product/brand API health

## 7. End-to-end flow maps

### Primary purchase journey

```text
Create disposable user (API or UI under test)
  → Login
  → Search Product
  → Open Product Details
  → Set Quantity
  → Add to Cart
  → Verify Product, Price, Quantity, Total
  → Checkout
  → Verify Delivery and Billing Addresses
  → Place Order with Synthetic Payment Data
  → Verify Confirmation
  → Download Invoice (separate assertion where needed)
  → Delete Disposable User
```

### Register during checkout

```text
Anonymous Cart
  → Proceed to Checkout
  → Register/Login Prompt
  → Register Unique User
  → Return to Preserved Cart
  → Checkout
  → Address Validation
  → Place Order
  → Confirmation
  → Cleanup User
```

### Invalid login

```text
Signup/Login
  → Invalid Credentials
  → Verify Exact Error
  → Verify No Authenticated Header/Session
```

### Remove from cart

```text
Add Two Products
  → Cart
  → Remove One Identified Row
  → Verify Target Removed
  → Verify Other Row and Totals Remain Correct
```

### Search/cart persistence

```text
Search Product Anonymously
  → Add Results to Cart
  → Login
  → Return to Cart
  → Verify Products Persist
```

## 8. Locator strategy

### Preferred order

1. `getByRole()` with accessible name for navigation, headings, links, and buttons.
2. `getByLabel()` where a real associated label exists.
3. `getByPlaceholder()` for the site's mostly placeholder-driven inputs.
4. `getByText()` for stable status/error messages, scoped to a page section or modal.
5. Stable `data-*`, form `name`, product ID, or href-based CSS when accessible names are absent/duplicated.
6. Never use fragile absolute XPath or deeply nested layout selectors.

### Proposed locator map

| Area | Preferred locator | Stable fallback / note |
| --- | --- | --- |
| Header | `getByRole('link', { name: 'Products' })`, `Cart`, `Signup / Login`, `Contact us` | Scope to `header`/navigation if duplicate footer text exists. |
| Login | `getByRole('heading', { name: 'Login to your account' })`; `getByPlaceholder('Email Address')`; `getByPlaceholder('Password')`; `getByRole('button', { name: 'Login' })` | Two Email Address inputs exist on the combined page; scope to the login form or use `input[name="email"]` within it. **Confirm form scope.** |
| Signup start | `getByRole('heading', { name: 'New User Signup!' })`; placeholders Name/Email Address; Signup button | Scope to signup form to avoid the login email input. |
| Registration | roles/labels for title, newsletter, offers; labels or `select` roles for DOB/country | Stable `name` attributes such as `password`, `days`, `months`, `years`, `first_name`, `address1`, `country` if labels are not associated. **Confirm names.** |
| Product search | `getByPlaceholder('Search Product')`; search button by accessible name if present | Known stable alternative from site markup is `#search_product` and `#submit_search`. **Confirm accessible name.** |
| Product card | Card-scoped text for unique product name and `getByRole('link', { name: 'View Product' })` | Use stable product-detail href `/product_details/<id>` or `data-product-id` for add action because normal/hover markup duplicates product text/actions. |
| Add modal | `getByText('Your product has been added to cart.')`; `getByRole('button', { name: 'Continue Shopping' })`; `getByRole('link', { name: 'View Cart' })` | Scope to visible modal/dialog; role may not be implemented semantically. |
| Product detail | heading by product name; text for Category, Availability, Condition, Brand; `getByRole('button', { name: /Add to cart/i })` | Quantity may require `input[name="quantity"]` because the crawled HTML exposes no useful label/placeholder. |
| Category/brand | `getByText('Women', { exact: true })`, then subcategory link text; brand link text | Exact text is necessary because Dress appears under multiple groups; scope within category accordion. Href routes are stable fallbacks. |
| Cart | row scoped by product link/name; row text for price/quantity/total | Stable row ID/product href and `.cart_quantity_delete[data-product-id]` are acceptable if no accessible name exists. **Confirm attributes.** |
| Checkout | headings `Address Details`, `Review Your Order`; Place Order link/button; comment label/placeholder | Scope address and order-review sections. Authenticated DOM needs implementation-time inspection. |
| Payment | placeholders/labels for Name on Card, Card Number, CVC, expiry; Pay and Confirm Order button | Stable form `name` attributes if labels are missing. Never put values into locator descriptions or logs. |
| Contact | heading `Get In Touch`; placeholders Name, Email, Subject; Submit button | Message/file inputs may need `textarea[name="message"]` and `input[type="file"]`; dialog is browser-native. |
| Subscription | `getByPlaceholder('Your email address')` scoped to `footer` | Arrow button may have no accessible name; use footer-scoped `#subscribe` after confirmation. |
| Messages | exact `getByText()` for documented account, login, subscription, review, contact, and order messages | Scope to the relevant alert/content region to avoid hidden/duplicate markup. |

No `getByTestId()` strategy is proposed because the inspected pages do not expose documented test IDs. Adding test IDs is not possible on this third-party practice site.

## 9. Page Object Model plan

Keep page objects action-oriented and assertion-light. Tests own business expectations; page objects expose page state and focused actions.

| Object/component | Responsibilities |
| --- | --- |
| `HomePage` | Open home, verify shell, expose featured/recommended products, scroll controls. |
| `Header` | Primary navigation, authenticated username, login/logout/delete-account actions. |
| `Footer` | Subscription controls and success state. |
| `LoginPage` | Login and initial signup forms; expose authentication/duplicate-email errors. |
| `SignupPage` | Account-information and address fields; create account. |
| `AccountStatusPage` | Account-created/deleted confirmation and Continue action. |
| `ProductsPage` | Search, product collection, category/brand results, add/open product. |
| `ProductCard` | One product's identity, price, View Product, and Add to cart action. |
| `CatalogSidebar` | Category accordion and brand navigation. |
| `AddToCartModal` | Continue Shopping or View Cart. |
| `ProductDetailsPage` | Product metadata, quantity, add-to-cart, review form. |
| `CartPage` | Locate rows by product, read price/quantity/total, remove, proceed to checkout, empty state. |
| `CheckoutPage` | Delivery/billing blocks, order review, comment, Place Order. |
| `PaymentPage` | Synthetic payment fields and confirmation action. |
| `OrderConfirmationPage` | Success state, invoice download, Continue. |
| `ContactUsPage` | Contact fields, file upload, dialog-aware submission, success navigation. |

Do not make a BasePage merely to wrap `click`, `fill`, or assertions. Shared site-wide behavior belongs in `Header` and `Footer`; repeated product behavior belongs in `ProductCard`.

## 10. Fixture plan

Start with these fixtures only:

| Fixture | Scope and lifecycle |
| --- | --- |
| `pageObjects` | Worker/test factory returning the page objects used by a test; alternatively instantiate directly until repetition justifies it. |
| `registeredUser` | Creates a unique disposable user through the account API before the test and deletes it in `finally`/teardown. Returns profile without logging password. |
| `authenticatedPage` | Depends on `registeredUser`, logs in once, and returns an authenticated page/context. Adopt storage state only after isolation and parallel behavior are proven. |
| `apiRequest` | Playwright `request` context using `baseURL`; used for API tests and data setup/cleanup. |
| `cartWithProducts` | Optional later fixture for checkout-focused tests; add only after several tests repeat the same setup. |

Avoid a large inheritance tree, global mutable users, and fixtures that silently perform most of an E2E flow. A test should make its important business steps visible.

## 11. Test data strategy

Recommended files under `test-data/`:

```text
test-data/
├── users.ts              # Valid profile template; runtime unique email factory
├── addresses.ts          # Full, minimal, and international/boundary addresses
├── products.ts           # Preferred product IDs/names plus search keywords
├── payments.ts           # Clearly synthetic values only; no real card data
├── invalid-values.ts     # Empty, malformed, length, numeric, and special-char cases
├── contact.ts            # Subject/message templates
└── files/
    ├── contact-note.txt  # Tiny safe upload
    └── unsupported.dat   # Tiny harmless negative upload if needed
```

Guidelines:

- Keep credentials in environment variables or generate disposable users at runtime; never commit them in specs.
- Treat product IDs/names as preferred candidates, not permanent truth. Verify through `/api/productsList` before UI use and skip/fail clearly if test preconditions disappear.
- Generate emails such as `qa+<run-id>-<random>@example.test` only if the site accepts the domain; otherwise use a configured test domain.
- Keep expected price/category/brand derived from the product API or current detail page when cross-layer consistency—not fixed seed data—is the assertion.
- Do not commit production-like personal data or real payment details.
- Keep destructive test records identifiable by a run prefix and always attempt cleanup.

Required environment additions for implementation may include:

```dotenv
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
TEST_EMAIL_DOMAIN=
```

Prefer disposable accounts; reserve configured credentials for the smallest login/logout coverage and never delete that shared account.

## 12. Execution strategy

- Pull request: Chromium smoke plus API smoke.
- Main branch: Chromium functional regression and negative tests.
- Nightly: Chromium, Firefox, and WebKit regression; E2E order, contact, subscription, download, boundary cases.
- Serial execution only for steps within one stateful E2E test. Keep independent specs parallel.
- Retry only through existing CI configuration; a passing retry remains a flakiness signal to investigate.
- Capture traces/screenshots per the existing Playwright configuration. Attach sanitized request/response summaries for API failures.

## 13. Major risks and mitigations

| Risk/limitation | Mitigation |
| --- | --- |
| Interactive behavior and dynamic DOM were not available during this planning pass | Inspect each page with Playwright Inspector before implementing its object; update only locator notes, not scenario intent. |
| Public shared environment and mutable accounts/orders/reviews/subscriptions | Unique run data, API cleanup, identifiable prefixes, no fixed shared account for destructive tests. |
| Third-party ads, analytics, video, slow images, and network variance | Assert first-party UI/state; optionally block known third-party hosts only after confirming it does not alter app behavior. Use web-first assertions, not sleeps. |
| Duplicate product markup for hover overlays | Scope to a product card by product ID/href and require visible actionable element. |
| Cart/session behavior across login and fresh contexts | Use isolated contexts; explicitly test persistence only in designated scenarios. |
| Browser-native dialogs and validation differ by engine | Register dialog handlers before actions; primarily assert submission/business outcome, with narrow engine-specific checks if required. |
| Undocumented field and payment validation limits | Characterize safely in a dedicated test, document observed rules, avoid assuming conventional card validation. |
| API may encode result status inside JSON rather than HTTP status | Parse and assert both transport status and documented response payload semantics. |
| Catalog and brand counts may change | Avoid exact global counts; anchor to API-confirmed products and relationships. |
| Destructive account deletion can break shared credentials | Only delete users created by the current test; protect configured users from cleanup. |
| Downloads and uploads vary by filesystem/browser | Use Playwright download/upload APIs, generated temporary paths, and content/size checks rather than OS UI. |

## 14. Entry and exit criteria for implementation

Entry:

- Interactive browser access is available for locator confirmation.
- A safe test email strategy and synthetic payment values are agreed.
- API create/delete behavior is characterized with a disposable account.
- Expected CI browser matrix and test schedule are agreed.

Exit for each automated module:

- P0/P1 scenarios pass in their intended browser matrix.
- Tests are independent and pass repeatedly without fixed waits.
- Created users and artifacts are cleaned up.
- Locators follow the strategy above and have no fragile XPath/deep CSS.
- Reports contain no credentials or payment secrets.
