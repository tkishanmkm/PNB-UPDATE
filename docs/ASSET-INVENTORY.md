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

At audit time the PNB-UPDATE repository contained **306 files** under `public/`:

| File type | Count |
|---|---:|
| PNG | 294 |
| SVG | 8 |
| WebP | 1 |
| MJS (PDF worker) | 1 |
| ICO | 1 |
| Web manifest | 1 |
| **Total** | **306** |

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

## Fonts

The decoded base tree contains 244 font file instances (TTF/OTF/WOFF/WOFF2). Names in the tree include system/UI and third-party fonts and icon fonts. The APK extraction's third-party license material did not yield a sufficiently clear per-font license record for a confident web redistribution decision. Font binaries were therefore not copied into `public/`. The app uses a local/system fallback stack (Mukta, Roboto, Arial, sans-serif) rather than making a request to Google Fonts.

This is a known visual-fidelity limitation: fallback metrics can differ from the APK's exact font rendering.
