# PNB ONE 4.43 UI extraction and PNB-UPDATE reference implementation

## Source package
- APK archive: PNB-ONE_4.43_apkcube.apks
- Android package: com.Version1
- App version: 4.43 (version code 260)
- Split APK members extracted: **32**
- Decoded base APK resource tree: **74,561 files** under PNB-ONE_4.43-extracted/decoded-base.

## Android UI resources
- Native Android UI reference pack: **4,493 files** in android-resource-reference (36,937,385 bytes).
- XML layouts/styles/values/menus: **3,020**.
- PNG/WebP/JPEG/AVIF image resources: **1,443**.
- Included resource families: layout variants, drawable variants, mipmap variants, animation/animator, color, values, menu, interpolator and navigation resources.
- This is a reference resource pack from the APK's Android resource tree; the visible main banking screens are implemented in the React Native bundle, not in these native Android XML files.

## PNB CCMS UI assets
- Full PNB CCMS package images and icons trees copied into ccms-assets.
- Copied CCMS files: **178** ({'icons': 18, 'images': 160}).
- Web-ready CCMS images and icons are also staged under PNB-UPDATE/public/pnb-one-ui/ccms/.
- Existing curated brand, navigation, common icon, payment logo, splash and dashboard assets remain in their dedicated folders.
- Six screenshot references supplied in the source folder are retained under reference-screenshots.

## Hermes bytecode analysis
- Main React Native bundle: assets/index.android.bundle, HBC v96.
- Bundle metadata: **283,285 functions** and **191,493 strings**.
- Function-source/debug table extracted: **914 entries**.
- String table saved as PNB-ONE_4.43-extracted/hermes-analysis/strings.txt (34,886,075 bytes).
- **28 targeted screen/component functions** were decompiled individually into hermes-analysis/screen-functions.
- The APK does not contain the original readable JSX/TypeScript project. A full function/module index pass was stopped because it consumed several gigabytes of RAM; the targeted cross-reference and single-function extraction passes succeeded. The report therefore does not claim a complete source-code decompilation.
- JADX was also attempted for DEX inspection but its full class pass did not complete.

## Screens reconstructed from the six references
1. **Dashboard** ? greeting/avatar, account carousel/card, balance visibility, four primary quick-action tiles, account shortcuts, quick links and raised bottom navigation.
2. **Send Money** ? four-across send-to tiles, Manage Payee, international transfer rows and the Others card group. Existing PNB-UPDATE transfer handlers are retained; items without an implementation remain visual-only.
3. **Services** ? searchable catalogue, expandable section rows and four-column icon tiles.
4. **Profile Settings** ? grouped four-column profile and account-settings grids, using the existing PNB-UPDATE routes.
5. **Government Schemes** ? reference-style list cards; informational only.
6. **Invest** ? reference-style list cards; informational only.

## Behavior and safety boundaries
- Existing PNB-UPDATE state, account data, transfer routes, statement generation, login, logout and settings logic remain the application's source of truth.
- Catalogue entries with no matching implemented PNB-UPDATE workflow are shown as non-operational/informational; no fake payment, investment, bill-pay or scheme-submission handler was added.
- No backend code, credentials, signing keys, certificates or unrelated third-party web bundles were copied into the app.
- Font families were identified in the APK, but font binaries were not copied into the project.

## Repository isolation
- All app edits, checks, commits and pushes are confined to PNB-UPDATE.
- The old repository is not used as a working directory or push target.
