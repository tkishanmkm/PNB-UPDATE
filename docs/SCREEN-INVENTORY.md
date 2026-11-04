# PNB ONE screen inventory

This inventory separates **APK visual evidence** from **web app routes already present in PNB-UPDATE**. An existing web route is not treated as proof that an identically named screen or behavior was recovered from APK bytecode.

## A. Screenshot-backed source screens

| # | Source reference | Visible page | Screen structure | Evidence level |
|---:|---|---|---|---|
| 1 | `reference-screenshots/Dashboard.webp` | Dashboard | Customer greeting/header; account carousel; balance show/hide; account shortcuts; primary quick-action tiles; quick links; lower navigation with raised scan action. | Direct screenshot |
| 2 | `reference-screenshots/3.webp` | Services | Red gradient page header; search field; grouped white panels; section headings; four-column icon/tile rows. | Direct screenshot |
| 3 | `reference-screenshots/4.webp` | Profile Settings | Header/back/home; grouped white cards; four-column profile and account-management tiles. | Direct screenshot |
| 4 | `reference-screenshots/5.webp` | Government Schemes | Header/back/home; rounded white list panel; stacked icon/text rows. | Direct screenshot |
| 5 | `reference-screenshots/6.webp` | Invest | Header/back/home; rounded list panel; stacked investment-category rows. | Direct screenshot |
| 6 | `reference-screenshots/pnb-2.webp` | Send Money | Header/back/home; four-across recipient/action grid; Manage Payee; international section; Others cards. | Direct screenshot |

## B. Existing PNB-UPDATE web page routes

The following routes were present in the correct repository before this reconstruction work. They remain web app views and implement the local specification; they are **not all individually verified against APK screenshots**.

| Route | Web page purpose | APK visual evidence |
|---|---|---|
| `/` | Local demo login / welcome | Partial authentication-related strings only; no supplied screenshot |
| `/dashboard` | Main dashboard | Dashboard screenshot |
| `/all-accounts` | Account list | Not directly screenshotted |
| `/account-statement` | Statement date/account selection | Not directly screenshotted |
| `/statement` | Transaction statement view | Not directly screenshotted |
| `/statement/analysis` | Local statement analytics | Not directly screenshotted |
| `/my-account` | Account overview | Not directly screenshotted |
| `/saving-account-details` | Savings account details | Not directly screenshotted |
| `/my-profile` | Profile/settings tile view | Profile Settings reference is related; exact route mapping is not proven |
| `/services` | Services catalogue | Services screenshot |
| `/government-schemes` | Informational schemes list | Government Schemes screenshot |
| `/invest` | Informational invest list | Invest screenshot |
| `/fund-transfer` | Send Money navigation | Send Money screenshot |
| `/fund-transfer/beneficiary` | Beneficiary selection | Not directly screenshotted |
| `/fund-transfer/beneficiary/list` | Payee list/manage | Manage Payee entry visible; detail page not screenshotted |
| `/fund-transfer/beneficiary/details/[id]` | Payee details | Not directly screenshotted |
| `/fund-transfer/to-beneficiary/[id]` | Local demo transfer form | Not directly screenshotted |
| `/fund-transfer/confirm/[id]` | Local demo confirmation/TPIN | Not directly screenshotted |
| `/fund-transfer/verify/[id]` | Local demo OTP confirmation | Not directly screenshotted |
| `/fund-transfer/success` | Local demo receipt view | Not directly screenshotted |
| `/settings` | Local data/settings/backup/PDF import | Not directly screenshotted |
| `/settings/edit-transaction/[id]` | Local transaction edit form | Not directly screenshotted |
| `/agent-live-chat` | Local support conversation | Not directly screenshotted |
| `/contact-us` | Local contact information view | Not directly screenshotted |
| `/faq` | Help/FAQ | Not directly screenshotted |

**Web route count: 25.** Dynamic parameter routes are counted as one route template each.

### Invest and Government Schemes detail verified in this step

- The APK Invest tile function lays out a horizontal row with a 62 × 62 leading icon box, Mukta title/description typography, and a trailing arrow control. The eight visible rows now use the corresponding exact APK image resources from `public/pnb-one-ui/apk-catalogue-icons/`.
- The APK Invest header reads `pageParams.mode` and changes its title to **Open FD/RD** for `mode=fdrd_only`. The web page exposes this as `/invest?mode=fdrd_only` and filters the visible catalogue to the two screenshot-backed FD/RD rows. It does not add any FD/RD form or create a deposit.
- Government Schemes and Invest remain non-operational catalogue pages. Their chevrons are visual reference elements only; no official external site, bank endpoint, application submission, or investment operation is invoked.
- Government Schemes and Invest now use their extracted APK-native PNG artwork rather than generic Lucide approximations. The PPF description's visible range separator was corrected to an en dash.

## C. Other discovered but unverified surfaces

The APK string table and targeted Hermes function extraction contain references to more UI concepts than the six screenshot references. The available extraction does not prove a complete one-to-one screen inventory for those strings. Therefore this audit does not invent a page for every string, button label, or extracted function.

## D. Dialogs, transient and error states

The six still screenshots do not provide enough evidence to claim exact reconstruction of all:
- Dialogs and confirmation sheets.
- MPIN/TPIN/OTP popups.
- Login help and error states.
- Loading skeletons/spinners.
- Empty states.
- Disabled tile explanations.
- Validation errors.
- Drawer and overflow-menu states.
- Animated page transitions.

Some corresponding web flows already exist. They remain subject to source-evidence limitations and are treated as local demonstrations if they resemble banking actions.
