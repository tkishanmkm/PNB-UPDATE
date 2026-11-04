# PNB ONE navigation map

The map distinguishes destinations directly visible in APK reference screenshots from routes implemented in the web app. A visual tile visible in a screenshot does not prove that the original destination's internal behavior was recovered.

## Screenshot-visible hierarchy

```text
PNB ONE
├── Dashboard
│   ├── Account carousel / balance visibility
│   ├── Account shortcuts
│   ├── Instant actions
│   ├── Quick links / services
│   └── Bottom navigation (raised Scan action)
├── Send Money
│   ├── Payee (Added)
│   ├── One Time (Bank) — shown in source reference; web action remains disabled
│   ├── Self (Own Account) — shown in source reference; web action remains disabled
│   ├── UPI (Payments) — informational/disabled in this local implementation
│   ├── Manage Payee
│   ├── Make International Payment — informational
│   └── Others (cardless cash, Sukanya, PPF) — informational
├── Services
│   ├── Search
│   └── Grouped service catalogue / four-column tiles
├── Profile Settings
│   └── Grouped profile/account setting tiles
├── Government Schemes
│   └── Informational list
└── Invest
    └── Informational list
```

## Web application routes

| Page / group | Route |
|---|---|
| Local login | `/` |
| Dashboard | `/dashboard` |
| Account list | `/all-accounts` |
| Account overview | `/my-account` |
| Savings account details | `/saving-account-details` |
| Profile | `/my-profile` |
| Services | `/services` |
| Government schemes | `/government-schemes` |
| Invest | `/invest` |
| Statement date selection | `/account-statement` |
| Statement view | `/statement` |
| Statement analysis | `/statement/analysis` |
| Send Money navigation | `/fund-transfer` |
| Beneficiary selection | `/fund-transfer/beneficiary` |
| Beneficiary list/manage | `/fund-transfer/beneficiary/list` |
| Beneficiary details | `/fund-transfer/beneficiary/details/[id]` |
| Local demo transfer form | `/fund-transfer/to-beneficiary/[id]` |
| Local demo transfer confirmation | `/fund-transfer/confirm/[id]` |
| Local demo OTP simulation | `/fund-transfer/verify/[id]` |
| Local demo receipt | `/fund-transfer/success` |
| Settings/data tools | `/settings` |
| Edit transaction | `/settings/edit-transaction/[id]` |
| Local support | `/agent-live-chat` |
| Contact | `/contact-us` |
| FAQ | `/faq` |

**Route-template count: 25.**

## Navigation safety

- Every implemented link should lead to an actual page.
- Catalogue entries without a supported local screen/workflow remain non-operational/informational rather than opening a guessed external page.
- The Send Money screen has only the saved-payee local demonstration path enabled; quick one-time/self/international/UPI payment entries are disabled.
- Transfer forms/TPIN/OTP screens are local demonstrations only and never contact banking/payment networks.
- Side-navigation entries without a corresponding implemented destination are displayed disabled, not as dead `#` links.

## Unknown destinations

The screenshots and targeted Hermes functions do not establish every bottom-nav item or all service-tile destinations. Those are left outside the recovered navigation map instead of assigning speculative routes.
