# PNB ONE 4.43 UI extraction and PNB-UPDATE reference work

## Source APK
- File: PNB-ONE_4.43_apkcube.apks
- Package id: com.Version1
- Version: 4.43 (version code 260)
- Split APK files extracted: 32
- Full decoded base resource tree: 74,561 files under PNB-ONE_4.43-extracted/decoded-base.

## Extracted UI material
- Android manifest, resource XMLs, resource tables and native layout references: 4,493 files in android-resource-reference.
- PNB CCMS package image tree: 160 image assets in package-images.
- Curated resource folder total: 4,794 files.
- Web-ready images/icons/logos staged in the PNB-UPDATE app: 293 files under public/pnb-one-ui.
- Six user-supplied screenshot references retained in reference-screenshots.
- Roboto and Mukta font resources were identified in the decoded APK. Font binaries remain in the local full decode and were not copied into the web app.

## Bundle/source limitation
The app bundle is React Native Hermes bytecode (assets/index.android.bundle). It does not include the original readable JSX/TypeScript source project. The Android resources and image package were decoded, and screen layouts were reconstructed from the supplied six screenshots plus the visible resource/text references. JADX was attempted for DEX inspection but did not complete its full class pass, so this report does not claim a full Java/JS source decompilation.

## Screens based on the references
1. Dashboard ? greeting/avatar header, account carousel area, expanded burgundy account card, balance visibility, account shortcuts, pastel two-column instant actions, quick links, and raised bottom navigation.
2. Send Money ? four-across action tiles, Manage Payee link to the existing beneficiary list, and the existing Indo-Nepal remittance row.
3. Services ? searchable service catalogue with collapsible groups and four-column icon tiles.
4. Profile Settings ? two grouped four-column icon grids using only PNB-UPDATE's existing profile/account routes.
5. Government Schemes ? reference-style list of scheme information cards.
6. Invest ? reference-style list of investment/product information cards.

## New PNB-UPDATE routes
- /services
- /government-schemes
- /invest

The Government Schemes and Invest catalogue rows are visual information cards only. They do not claim to submit scheme or investment applications because those transaction workflows are not present in the current PNB-UPDATE code. Unsupported quick actions remain disabled; supported routes continue to use existing PNB-UPDATE handlers.

## Project isolation
All code changes are made in the PNB-UPDATE working copy whose origin remote is https://github.com/tkishanmkm/PNB-UPDATE.git. The source repository tkishanmkm/pnb- is not used as a working directory or push target.
