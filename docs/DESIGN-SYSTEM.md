# PNB ONE 4.43 visual design system

This document records values and patterns that can be supported by the six source screenshots, extracted resources and current implementation. It does not claim a complete original Android design-token export.

## Color and surfaces

| Token / role | Value or observed treatment | Evidence |
|---|---|---|
| Main page header | Deep maroon → red → muted coral gradient | Repeated in Services, Profile Settings, Government Schemes, Invest and Send Money screenshots. |
| Reference gradient sample | `linear-gradient(112deg, #960b2c 0%, #bd173d 52%, #e15d70 100%)` | Approximate sample from screenshot visual audit; not an XML color token. |
| Page backdrop | Very light neutral grey/white | Screenshot observation. |
| Main card/panel | White | Screenshot observation. |
| Section separators | Light neutral border/shadow | Screenshot observation. |
| Accent/highlight | PNB red/maroon family | Screenshot observation; exact global token not proven. |

The values in this table are reference samples/observations. The Android reference resource tree also has XML color/style resources, but the RN main page token mapping is not fully recovered.

## Typography

- 244 font file instances exist in the decoded APK tree.
- Targeted Hermes output and Android resources expose font-family references; the available report does not identify a complete per-component weight/size map.
- The web app uses `Mukta, Roboto, Arial, sans-serif` fallbacks and no Google Fonts network import.
- Font binaries were not bundled because the extracted third-party license data did not conclusively establish a redistributable license for each family/format.

Exact glyph metrics, weights and letter-spacing should be treated as approximate.

## Reusable visual patterns

### Page header
- Full-width red gradient band.
- Back action at leading edge.
- Center/left title according to page structure.
- Home action at trailing edge on screenshot-backed catalogue/list pages.

### White content panels
- Rounded outer surface.
- Light shadow or border.
- Section title at top.
- Repeated list rows or service tiles inside.

### Four-column tile grids
- Used on Services, Profile Settings and Send Money references.
- Icon/mark above concise label.
- Tight but even horizontal gutters.
- Grid alignment is mobile-first; do not stretch into a desktop dashboard grid if it changes the reference rhythm.

### List pages
- Grouped white list panels over a pale background.
- Leading visual mark/icon, label and trailing chevron where visible.
- Scheme/invest rows are informational unless an existing local workflow is explicitly implemented.

### Dashboard
- Greeting/customer band.
- Horizontally browsable account card(s).
- Balance visibility control.
- Compact shortcut/action groups.
- Raised central bottom-navigation action.

## Responsive behavior

The source screenshots are mobile references. Preserve mobile density and page structure first. Existing Next.js styles provide a wider layout fallback, but no APK screenshot or source breakpoint table was available for tablet/desktop; those adaptations are implementation choices, not APK-recovered values.

## Accuracy boundary

No screenshot overlay/image-diff comparison with a running Android app was available in the audit. The six reference screens support structural reconstruction only; no pixel-perfect claim is made. Unseen modal, error, loading and empty states remain unverified.
