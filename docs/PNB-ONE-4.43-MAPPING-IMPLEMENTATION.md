# PNB ONE 4.43 — mapping implementation update

**Repository scope:** `tkishanmkm/PNB-UPDATE` only
**Source:** supplied PNB ONE 4.43 APK extraction and six original reference screenshots
**Date:** 2026-11-04

## Implemented in PNB-UPDATE

### Splash
- Replaced the hand-composed splash layout with the exact extracted `assets_pnb_splashscreen_final.png` resource.
- Kept it full-viewport and contained on mobile, with no extra gradient, circle, or separately repositioned logos.

### Dashboard
- Replaced the four Instant Action icons with the exact APK resources for Send Money, UPI, Bills & Recharge, and Open FD/RD.
- Mapped the five screenshot-visible bottom-bar assets: Shoppe/cart, Offers, Scan & Pay, Credit Card, and Emergency.
- The existing user-uploaded icon setting still takes precedence over the extracted default where the dynamic icon component supports it.

### Services
- Mapped the Pay & Transfer category header to `allservices_pay.png`.
- Compared the numbered APK glyph contact sheet with the original Services screenshot and mapped these ten visible tile icons:
  - Fund Transfer — `serviceicon_1.png`
  - Bill Payments — `serviceicon_2.png`
  - UPI — `serviceicon_3.png`
  - Manage Beneficiary — `serviceicon_4.png`
  - Cardless Cash Withdrawal — `serviceicon_6.png`
  - My Transactions — `serviceicon_8.png`
  - Pay to Contact — `serviceicon_9.png`
  - Standing Instructions — `serviceicon_10.png`
  - PM Care — `serviceicon_11.png`
  - View/Generate MMID — `serviceicon_52.png`
- The original four-column layout, tile order and labels remain in place. The remaining four visible Pay & Transfer tile glyphs are not assigned until the exact source match is clear.

### Send Money
- Replaced all nine visible action/recipient icons with their exact named APK resources: Self, Payee, One Time, UPI, Outside India, Nepal, Cardless Cash, Sukanya Samriddhi, and PPF.
- Existing disabled/local-demo behavior is preserved; this does not enable bank transfers.

### Profile Settings
- Replaced the two group-header icons with the extracted `myprofile_profile.png` and `myprofile_account.png` resources.
- Mapped tile icons only where the contact sheet has a clear match: Set User ID, Check KYC Status, Safety Ring, Reward Points, My Transaction, E-Statement Registration, E-Statement Deregistration, and Account Statement.
- Other profile tiles retain their existing icons because the exact glyph association is not yet proven.

### MPIN login and registration
- Kept the existing root route as the local 4-digit MPIN login; replaced its welcome avatar with the extracted pre-login welcome-avatar resource.
- Added a **NEW USER? REGISTER** entry from MPIN login.
- Added `/registration` as a text-evidence reconstruction of the APK's five-step existing-customer flow: choose NEW USER → enter Customer ID → verify OTP → verify debit-card and linked-account details → set password.
- The APK extraction provides the registration steps and endpoint labels, but no original registration screenshot was supplied. The new page therefore shows the verified steps only; it intentionally has no fields for card data, OTP or passwords and makes no network calls.

## Still unresolved — deliberately not guessed

- The APK has 54 numbered `serviceIcon_1…serviceIcon_54` resources. Sixteen distinct numbered glyphs are used in the Services/Profile mappings above. The remaining numbered glyphs have no proven title-to-icon crosswalk; the four previously missing visible tile glyphs were cropped directly from the original Services screenshot instead.
- No Pay & Transfer tile visible in the supplied Services screenshot remains without a matching visual. The four screenshot-cropped glyphs are documented separately from standalone APK assets.
- Several Profile Settings tile icons remain unresolved, including Change MPIN, Set/Reset TPIN, De-activation, Set Account Nickname, Promotional Content Preference, Modify Account Access, Set Limits, Quick View Balance, My Account, All Accounts, Contact Us, and App Settings.
- The four remaining Services category header images are now mapped from the extracted APK. Their expanded page screenshots, exact item order and exact small tile glyphs remain unresolved.
- Only six original screens are screenshot-backed: Dashboard, Services, Profile Settings, Government Schemes, Invest, and Send Money. The main registration flow is text-backed; the MPIN login is string/resource-backed but has no supplied screenshot. Other web routes are not claimed to be exact APK screen reconstructions.

## Safety and scope
- Registration, MPIN, transfer and other bank actions remain local/demo-only. No PNB authentication, OTP, card validation, payment, or bank API is invoked.
- Only the PNB-UPDATE worktree is changed. No PNB-, Paxones/CleanP2P, BOB-NEW, Fino, or other project is included.
### Additional Services categories
- Mapped the four remaining category header images from the extracted APK artwork: Manage Cards, Cheque Services, Tax Related and Others.
- Added the extracted category labels and candidate child-service catalogue entries to the Services accordion. The labels are source-evidenced, but the full expanded-screen screenshots and exact item order are not available; this is a catalogue reconstruction, not a claim of pixel-identical original category pages.
- Kept unresolved child tile glyphs as generic placeholders. Did not assign any of the 54 numbered serviceIcon_N files without a verified title crosswalk.
- Preserved 17 matching named feature illustrations separately under service-page-illustrations/. These are page/feature artwork, not asserted to be the small menu tile glyphs.
