# PNB ONE APK asset inventory

## Source extraction inventory

| Source group | Count | Notes |
|---|---:|---|
| APK split package members | 32 | Base APK and configuration splits from the APKS archive. |
| Decoded base APK files | 74,561 | Full decoded base resource/code tree. |
| Curated Android UI resource subset | 4,493 | 3,020 XML/style/value/menu/navigation/related resource files and 1,443 image resources. |
| Additional CCMS asset subset | 178 | 18 icons and 160 images. |
| Whole curated UI-resource directory | 5,011 | Includes the 4,493 Android-reference files, CCMS content and additional report/manifest/other files. |
| Decoded-base font file instances | 244 | Multiple weights/formats and icon fonts may refer to the same family. |
| Targeted Hermes function output files | 39 | 28 targeted screen/component function decompilations plus related function output files. |
| Screenshot reference files | 6 | Dashboard, Services, Profile Settings, Government Schemes, Invest, Send Money. |

The 1,443 native image count is a resource count, not a count of unique app icons. The 244 font count is a file-instance count, not a count of distinct font families.

## Existing app public assets

The initial PNB-UPDATE audit counted **306 files** under `public/`. This reconstruction step added 16 exact catalogue icons extracted from the APK's `drawable-mdpi` resources. The current directory therefore contains **322 files**:

| File type | Initial audit | Current |
|---|---:|---:|
| PNG | 294 | 310 |
| SVG | 8 | 8 |
| WebP | 1 | 1 |
| MJS (PDF worker) | 1 | 1 |
| ICO | 1 | 1 |
| Web manifest | 1 | 1 |
| **Total** | **306** | **322** |

Relevant directories:
- `public/pnb-one-ui/` — extracted/curated PNB ONE icon, logo, payment-mark and screen art used by web components.
- `public/pnb-splash/` — original splash/logo/wordmark/PCI-DSS artwork already included in the repository.
- `public/pdf.worker.min.mjs` — local PDF.js worker. PDF import does not need a third-party worker CDN.

## Asset reuse policy

- Prefer the existing local asset in `public/` over a new icon approximation.
- Do not replace original bank/app logos with emoji or text.
- Use the exact original asset where the page and visual evidence identify it.
- Do not use placeholder image hosts.
- Uploaded custom images are stored as local data URLs in IndexedDB. Imported external URL strings are not accepted by image rendering helpers.
- A missing/unverified artwork item is not replaced with a guessed PNB logo or random stock image.

## Logos and icons

The source extraction contains the native Android image-resource collection and the CCMS icons/images tree. The existing web app public directory retains the curated PNB logo, splash mark, bank wordmark, PCI-DSS mark, dashboard/payment/navigation and CCMS assets.

An exact count of **unique logos** cannot be asserted from the extraction report because logo variants, density variants, language variants and duplicated copies are not deduplicated by semantic role. The source reports 18 CCMS icon files and 1,443 native image files; those are reproducible counts.

## APK-backed catalogue icon reuse

The exact native PNG resources below were copied from the decoded APK `res/drawable-mdpi` folder into `public/pnb-one-ui/apk-catalogue-icons/`. They are used by the screenshot-backed Invest and Government Schemes rows; no substitute Lucide icon is used for those category marks.

| Web asset | APK drawable resource | Page row |
|---|---|---|
| `invest-open-fd.png` | `assets_resources_icons_invest_openfd.png` | Open Fixed Deposit |
| `invest-open-flexi-rd.png` | `assets_resources_icons_invest_openflexird.png` | Catalogued source asset; retained for later supported FD/RD view work |
| `invest-open-rd.png` | `assets_resources_icons_invest_openrd.png` | Open Recurring Deposit |
| `invest-asba.png` | `assets_resources_icons_invest_asba.png` | Apply IPO/ASBA |
| `invest-demat.png` | `assets_resources_icons_invest_demat.png` | Demat & Trading Account |
| `invest-mutual-funds.png` | `assets_resources_icons_invest_mutualfunds.png` | Mutual Funds |
| `invest-bank-products.png` | `assets_resources_icons_invest_apply_bank_product.png` | Invest / Apply Bank Products |
| `invest-online.png` | `assets_resources_icons_invest_online.png` | Apply Online |
| `invest-rbi-retail-direct.png` | `assets_resources_images_imagelists_retail.png` | RBI Retail Direct |
| `scheme-apy.png` | `assets_resources_icons_govtschemes_apy.png` | Atal Pension Yojana |
| `scheme-papl.png` | `assets_resources_icons_govtschemes_papl.png` | National Pension System (source asset; exact acronym expansion is not exposed by this screenshot/function subset) |
| `scheme-pmjjby.png` | `assets_resources_icons_govtschemes_pmjjby.png` | Pradhan Mantri Jeevan Jyoti Bima Yojana |
| `scheme-pmsby.png` | `assets_resources_icons_govtschemes_pmsby.png` | Pradhan Mantri Suraksha Bima Yojana |
| `scheme-ppf.png` | `assets_resources_icons_govtschemes_ppf.png` | Public Provident Fund |
| `scheme-scss.png` | `assets_resources_icons_govtschemes_scss.png` | Senior Citizens Savings Scheme |
| `scheme-sukanya.png` | `assets_resources_icons_govtschemes_sukanya.png` | Sukanya Samriddhi Account |

The APK string table and screenshot support the displayed row titles/descriptions. The app keeps these entries informational: there are no submit, redirect, account-linking or investment actions in this reconstruction.

## Fonts

The decoded base tree contains 244 font file instances (TTF/OTF/WOFF/WOFF2). Names in the tree include system/UI and third-party fonts and icon fonts. The APK extraction's third-party license material did not yield a sufficiently clear per-font license record for a confident web redistribution decision. Font binaries were therefore not copied into `public/`. The app uses a local/system fallback stack (Mukta, Roboto, Arial, sans-serif) rather than making a request to Google Fonts.

This is a known visual-fidelity limitation: fallback metrics can differ from the APK's exact font rendering.
