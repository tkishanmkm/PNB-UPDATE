# PNB ONE — local data manager

A Next.js reconstruction of the PNB ONE 4.43 mobile interface, using visual evidence from the original split APK and extracted UI assets. The app's local data features follow the PNB ONE written project specification.

> **This is not the official PNB application and is not connected to PNB, NPCI, UPI, payment gateways, remittance networks, or any bank system.** Login, OTP, transfer, receipt and balance flows are local demonstrations. No real banking authentication, live bank balance, or money movement is available.

## Scope and evidence

The APK extraction exposed six screenshot-backed reference screens (Dashboard, Services, Profile Settings, Government Schemes, Invest and Send Money), 32 split APK members, a 74,561-file decoded base APK tree, 4,493 curated Android UI resources, 178 CCMS assets, 244 font file instances and 28 individually decompiled screen/component functions.

The main app is a React Native/Hermes HBC v96 bundle. Its original readable JSX/TypeScript source was not recovered, and complete module decompilation was not performed. The six screenshots do not show every dialog, loading state, error state or navigation destination. See [APK UI Audit](docs/APK-UI-AUDIT.md) for the precise limits; do not interpret 25 existing web routes as 25 independently recovered APK screens.

## Local technology

- Next.js App Router, React, TypeScript.
- Browser IndexedDB through `pnb_pro_db` / `app_state`.
- Local PDF text extraction through PDF.js.
- Local PDF report generation with jsPDF and jspdf-autotable.
- JSON backup and restore with structural validation.
- Local transaction, account and payee data management.
- No Genkit, Google GenAI, AI API, banking API or cloud database dependency.

## Implemented local features

- Customer/account profile fields, locally stored balances and account selection.
- Transaction add/edit/delete/search/filter/sort and running-balance reconciliation.
- Account-isolated transaction history and quarterly average balance calculation.
- PDF text extraction in the browser; AI and OCR are not used. Scanned/image-only PDFs are not supported.
- Statement preview and three import modes:
  1. **Replace App Data** replaces the saved accounts and transaction ledger with one statement-backed account and its transactions; unrelated payees, support history, app settings and appearance assets remain.
  2. **Replace Transactions Only** replaces the matched account's transactions, not account details or other accounts.
  3. **Save Transactions** appends statement rows and skips only exact same-ID/same-content duplicates; a conflicting reused ID aborts the import.
- Local multi-page PDF report generation. Generated reports are app outputs, **not official bank-issued statements**.
- Statement JSON export and whole-app JSON backup/restore (50 MB input limit).
- Backup files exclude MPIN, TPIN, local login password, OTP and PDF password. Restoration preserves current device credentials and forces a fresh app login.
- Locally stored payees, app settings and support-chat history.
- Screenshot-backed Invest and Government Schemes catalogues use the exact extracted APK-native row icons. The APK's `fdrd_only` header mode is represented by `/invest?mode=fdrd_only`; this filters the catalogue only and does not open or submit a deposit request.
- Local support responses based on data already saved in this browser.

## Start the application

Requirements: Node.js compatible with the current Next.js project (Node 20+ recommended) and npm.

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation commands

```powershell
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

## Local storage and privacy

- New app state is persisted to IndexedDB (`pnb_pro_db`, object store `app_state`).
- Older localStorage state may be read once for migration and removed after successful IndexedDB migration. It is not the new persistence target.
- Clearing browser site data removes the local app database and uploaded local assets unless the user has exported a private JSON backup.
- Imported JSON image references are restricted to local bundled paths or supported base64 image data; arbitrary external image URLs are not loaded.
- Do not put actual bank statements, credentials or personal records in the Git repository. Local records belong in the user's browser only.
- Demo login/OTP/TPIN screens are local simulation controls, not bank security verification.

## Documentation

- [APK UI audit](docs/APK-UI-AUDIT.md)
- [Screen inventory](docs/SCREEN-INVENTORY.md)
- [Asset inventory](docs/ASSET-INVENTORY.md)
- [Design system](docs/DESIGN-SYSTEM.md)
- [Navigation map](docs/NAVIGATION-MAP.md)
- [Existing extraction reference](docs/PNB-ONE-4.43-UI-REFERENCE.md)

## Important limitations

1. Visual source evidence consists of six still reference screens, not a recorded full APK session.
2. The complete original React Native component source, all routes and every interaction were not recovered from Hermes.
3. Not all of the 25 pre-existing web routes have direct APK screenshot evidence.
4. No pixel-perfect comparison against the running Android APK was available.
5. Font binaries were catalogued but not redistributed into the web bundle because a clear per-font license basis was not established.
6. Catalogue features without a written-spec local workflow are disabled/informational; no live bank functionality has been invented.
