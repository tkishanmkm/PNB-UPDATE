# PNB ONE 4.43 — APK UI audit

**Target repository:** `tkishanmkm/PNB-UPDATE`
**Audited package:** `PNB-ONE_4.43_apkcube.apks`
**Android package ID:** `com.Version1`
**Version:** 4.43 (`versionCode 260`)

## Executive result

The APK was inspected as a split-package application and its supplied extraction outputs were reviewed. The visible banking UI is implemented primarily in a React Native/Hermes bundle (HBC v96), not in the decoded Android XML layouts. Six screenshot references were available and examined. Twenty-eight screen/component functions were individually decompiled by the supplied extraction workflow, and the app bundle metadata exposes a much larger function/string index.

This is enough to reconstruct the six documented reference screens and reuse the project’s previously implemented PNB ONE routes/components. It is **not** evidence that every APK screen, modal, transient state, route, or original interaction has been recovered. The original readable JSX/TypeScript source was not present; full-module decompilation was stopped for memory safety. JADX’s full class pass also did not complete.

## Source directories inspected

Original source directories (read-only):
- `C:\Users\theki\Music\PNB upate\PNB-ONE_4.43-extracted`
- `C:\Users\theki\Music\PNB upate\PNB-ONE_4.43-ui-resources`
- `C:\Users\theki\Music\PNB upate\PNB-ONE_4.43_apkcube.apks`

The extracted directory included the base APK, split APKs, decoded base resources, Hermes bundle analysis, string table and targeted function outputs. The resource directory included the curated Android resource reference, CCMS imagery/icons, asset manifest, extraction report and six visual references. The originals were not edited.

## Package and extraction facts

| Item | Observed |
|---|---:|
| Split APK members | 32 (base + configuration splits) |
| Android package | `com.Version1` |
| App version | 4.43 |
| Version code | 260 |
| Decoded base-tree files | 74,561 |
| Curated Android resource reference | 4,493 files |
| Android XML layouts/styles/values/menus | 3,020 |
| Android raster/vector image resources | 1,443 |
| Additional CCMS assets | 178 (18 icons, 160 images) |
| Curated UI-resource directory total | 5,011 files |
| APK font files in decoded base | 244 file instances across formats/weights |
| Hermes format | HBC v96 |
| Hermes function metadata | 283,285 functions |
| Hermes string metadata | 191,493 strings |
| Function source/debug entries | 914 |
| Targeted screen/component decompilations | 28 |
| Targeted function output files | 39 |
| Visual screenshot references | 6 |

The resource-folder total and the Android-reference subset are different inventories. Do not add them as though one were a single flat, deduplicated asset count. Some font files are multiple formats/weights and icon fonts; 244 is a file count, not a count of distinct type families.

## Architecture observations

- Main screen UI: React Native/Hermes bundle, `assets/index.android.bundle`, HBC v96.
- Android package contains native resource XML, styles, values, drawable/mipmap variants, animations, navigation resources, DEX and split configuration packages.
- Android XML resources are useful for native wrappers, themes and app resources, but do not by themselves define the main RN screen hierarchy.
- The extracted project does not contain the original readable React component tree. Function/string indices and individually decompiled functions are partial evidence only.
- The app's business implementation was **not** imported from the APK. Existing PNB-UPDATE functionality is governed by the written local-data specification and the existing app code.

## Screenshot-backed screens

| Screen | Evidence | Recovered UI structure |
|---|---|---|
| Dashboard | `Dashboard.webp` | Greeting/customer header, account carousel/card, balance-visibility toggle, account shortcuts, quick actions, quick links and bottom navigation including a raised center scan action. |
| Services | `3.webp` | Red gradient title/header with back and home actions, search, white rounded content groups, expandable/catalogue sections and four-column service tiles. |
| Profile Settings | `4.webp` | Red header and grouped four-column profile/account setting tiles inside rounded white sections. |
| Government Schemes | `5.webp` | Red gradient title/header with white rounded, vertically arranged informational list panel. |
| Invest | `6.webp` | Red gradient title/header with white rounded list panel and leading icons. |
| Send Money | `pnb-2.webp` | Red gradient header, four-across send-to grid, Manage Payee, international group and an Others card group. |

The screenshots establish high-level page structure and visible branding. They do not provide source evidence for every tap target, animation, accessibility state, responsive breakpoint, popup, or hidden destination.

## Design observations (evidence-bounded)

- Repeated reference header treatment: deep maroon-to-red/pink gradient.
- Main content surfaces: white/light panels on a pale neutral background.
- Section groups: rounded white surfaces with restrained borders/shadows.
- Services/profile grids: four columns at the reference mobile width.
- Typography family names and weights appear in extracted application resources and targeted functions; 244 font file instances exist in the decoded APK, but the font licensing/asset provenance was not sufficiently unambiguous to copy binary font files into the web project. The implementation currently uses local/system fallbacks, not a claim of exact font metrics.
- Original logo and imagery are retained from the project’s extracted `public/pnb-one-ui` and `public/pnb-splash` folders. No text-only logo or emoji substitute was introduced.

See [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md), [ASSET-INVENTORY.md](./ASSET-INVENTORY.md), [SCREEN-INVENTORY.md](./SCREEN-INVENTORY.md), and [NAVIGATION-MAP.md](./NAVIGATION-MAP.md).

## PNB-UPDATE repository baseline

The correct working copy is `C:\Users\theki\PNB-UPDATE`, remote `https://github.com/tkishanmkm/PNB-UPDATE.git`, branch `main`. It was cloned at the remote’s initial main head before edits. The separate `pnb-work` / `PNB-` checkout was not used or modified.

The existing app contained 25 Next.js page routes and an established IndexedDB implementation before this work. Those project pages are not automatically evidence that 25 APK screens were independently discovered.

## Local functionality boundary

The following is local app behavior, not APK functionality extraction:
- Browser IndexedDB storage using database `pnb_pro_db`, object store `app_state`.
- Local customer/account/transaction/payee/settings records.
- Local-only PDF text extraction with PDF.js.
- Local PDF report generation with jsPDF/autotable.
- JSON backup/restore, with credential fields excluded.
- Local demonstration transfer flows that update only the local ledger.
- Local support-chat responses based on the browser's saved app data.

No PNB, NPCI, UPI, payment, remittance, account-verification, SMS, or real banking endpoint is integrated. No bank authentication is performed. No live balance is shown. A locally recorded demo transfer does not move money.

## Recovery limitations and uncertainty

1. Only six visual reference screenshots were available in the inspected reference folder.
2. The complete readable React Native source was not recovered from Hermes bytecode.
3. Only 28 targeted screen/component functions were decompiled individually.
4. A full function/module index decompilation was stopped due to multi-GB memory demand; this was not retried.
5. JADX full DEX class analysis did not complete.
6. The six screenshots do not expose every modal, drawer, popup, error, empty, or loading state.
7. Not every one of the 25 existing web routes has a direct screenshot-to-route source mapping.
8. Original app font files were catalogued, but exact license verification and web embedding were not completed; the web app retains a local/system font stack.
9. No pixel-difference visual comparison against a running APK was performed. Pixel-perfect parity is therefore not claimed.

## Scope control

Only the `PNB-UPDATE` repository was edited. APK/APKS and extracted source directories were treated as read-only. The application has no live banking integration and no cloud AI support flow.
