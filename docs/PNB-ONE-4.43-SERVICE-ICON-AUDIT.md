# PNB ONE 4.43 â€” service, page, category and icon audit

**Audit target:** tkishanmkm/PNB-UPDATE only
**Source APK:** PNB-ONE_4.43_apkcube.apks
**Package/version:** com.Version1, 4.43 (versionCode 260)
**Purpose:** identify original extracted UI resources and page/category evidence for the 64 requested items. This is an audit; no app UI, routing or business logic was changed.

## 1. Audit result and evidence limits

The decoded base APK tree contains 74,561 files. The existing extraction report records 32 split APK members, a 4,493-file Android UI-reference subset (3,020 XML/layout/value files and 1,443 image resources), 178 CCMS images/icons, and six supplied reference screenshots. This audit searched the decoded base resource tree, named image resources, SVG files, Android drawable XML, the Hermes string table, saved cross-reference JSON and targeted screen-function decompilations.

The current decoded base tree contains 1,819 files with an .svg extension, 1,610 PNGs and 3,061 XML files. These are whole-tree file counts, not counts of PNB menu icons. They include density duplicates, SDK artwork, CCMS/payment logos, Android controls and a separate bundled web stock/trading asset collection. The main PNB ONE menu artwork located here is predominantly PNG in res/drawable-mdpi, not standalone SVG.

**Important limitation:** the Services screen uses a dynamic getAllServices data path. The string/cross-reference index identifies getAllServices, readPrimaryIconSet, dispatchItemTap, IconTile and SectionRow, but the saved targeted decompilation does not expose the complete service-data array or its item-to-icon-index mapping. The 54 numbered serviceIcon_N.png images are real extracted resources, but their exact association with menu labels is not established by the recovered files. They are deliberately left unmapped below.

Only six page screenshots were supplied: Dashboard, Services, Profile Settings, Government Schemes, Invest and Send Money. In particular, the Pay & Transfer group is visible in the Services screenshot; Cards, Cheque, Tax Related and Others category icon files are present, but the corresponding expanded screens were not supplied. A label in the string table or an image filename proves that a resource/text exists; it does not alone prove the complete hierarchy, exact tap destination or exact icon displayed at runtime.

## 2. Page and navigation structure supported by evidence

### A. Dashboard â€” directly screenshot-backed

The Dashboard screenshot shows:
- Greeting/customer header and account card/carousel.
- **Instant Actions:** Send Money, UPI, Bills & Recharge, Open FD/RD.
- **Quick Links** area, with an All Services entry.
- Bottom navigation: Shoppee, Offers, raised Scan & Pay, Credit Card and Emergency.

The native resource names for these dashboard items are explicit and are listed in the matrix below. The original resource for the cart glyph is named postloginbottombar_profile.png in the APK, but its drawn symbol and the screenshot's visible label are the Shoppe/cart item. The separate Shoppe page artwork is named pnb_shopee.png / PNB_Shopee.png.

### B. Services â€” directly screenshot-backed

The Services screenshot shows a red gradient header with Back and Home, a Search field, and expandable category sections. The visible expanded section is **Pay & Transfer**. Its visible four-column tile order is:

| Row | Tile 1 | Tile 2 | Tile 3 | Tile 4 |
|---:|---|---|---|---|
| 1 | Fund Transfer | Bill Payments | Generate QR | Approve to Pay |
| 2 | UPI | Pay to Mobileâ€¦ | Manage Beneficiary | Pay To Contact |
| 3 | Standing Instructions | My Transactions | View/Generateâ€¦ MMID | Check IMPS Status |
| 4 | PM Care | Card less Cash Wiâ€¦ | â€” | â€” |

The recovered SectionRow and IconTile components support the structure: a category header with a leading category icon, title and expand/collapse chevron; inside an expanded category, pressable icon tiles with an icon area and a two-line label. The extracted tile function records a 68Ã—68 icon container; the section header records a 62Ã—62 category icon area. These are code-derived component values, not pixel-difference measurements.

The APK contains named top-level category resources:
- assets_resources_icons_allservices_pay.png â€” Pay & Transfer.
- assets_resources_icons_allservices_cards.png â€” Cards / Manage Cards.
- assets_resources_icons_allservices_cheque.png â€” Cheque.
- assets_resources_icons_allservices_tax.png â€” Tax Related.
- assets_resources_icons_allservices_other.png â€” Others.

The string table also explicitly names **Cheque Services** and lists six child services in its help text: Apply Cheque Book, Inquire Cheque Status, View/Stop Cheque, Destroy Cheque, Positive Pay Service and PNB Suraksha. It refers to **Other Services â€“ Register/Update Nominee**. The string table contains the label **Tax Related Services**. These statements establish those labels and references, but not every row's exact runtime placement or a fully recovered accordion tree.

### C. Send Money â€” directly screenshot-backed

The Send Money screenshot shows:
- Header: Send Money, Back and Home.
- **Send Money to** section with **Manage Payee** text link.
- Four recipient tiles: Self (Own Account), Payee (Added), One Time (Bank), UPI (Payments).
- **Make International Payment** section with Send Money Outside India and Send Money Nepal.
- **Others** section with Cardless Cash, To Other Sukanya Samridhi and To PPF Account.

Named extracted icon resources exist for each of those four recipient types, the two international destinations and the three Others entries. The Manage Payee entry is a separate text action; the targeted function references a navigation action named goToPage_Manage_Benef_Edit1.

### D. Other screenshot-backed pages

- **Government Schemes:** a separate page with Back/Home header and a vertically stacked list. Seven matching native scheme icons were confirmed in the preceding Invest/Schemes asset audit.
- **Invest:** a separate page with Back/Home header and a vertically stacked list. Eight matching Invest category icons were confirmed. The APK Invest header also contains an fdrd_only mode which displays â€œOpen FD/RDâ€.
- **Profile Settings:** a screenshot-backed grouped settings grid. This is a separate view from the Services accordion.

These screenshots do not establish that the 64 requested items are all independent pages. Many are catalogue tiles or nested service actions.

## 3. Extracted SVGs and payment logos

The decoded base contains a small, clearly named group of SVG payment/provider marks under:

assets/flutter_assets/packages/pnb_ccms_package/assets/icons/

| Extracted SVG | What its filename establishes |
|---|---|
| amazonpay.svg | Amazon Pay mark |
| bhim.svg | BHIM mark |
| credpay.svg | CredPay mark |
| googlepay.svg | Google Pay mark |
| hdfc.svg | HDFC mark |
| ic_upi_logo.svg | UPI logo |
| paytm.svg | Paytm mark |
| phonepe.svg | PhonePe mark |

These are payment/provider logos, not the set of 64 navigation tile icons. They are inside the CCMS package and can be associated with payment-brand/UPI-related visual contexts; the source does not show that all eight logos appear together on the primary Dashboard or Services tiles.

Android vector drawables are also present as XML under res/drawable, particularly for embedded UPI SDK features. Examples include bharatqr_code.xml, m_ui_sdk_ic_bharatqr_code.xml and m_ui_sdk_upi_icon.xml. These belong to native/embedded SDK screens unless a screenshot or source mapping proves otherwise. They are not assigned as the main Services tile artwork.

## 4. Named resource groups â€” exact extracted filenames

All filenames below are from the decoded APK's res/drawable-mdpi directory unless otherwise stated.

### Dashboard shortcut and bottom-bar artwork

| UI label / screenshot area | Extracted resource |
|---|---|
| Send Money â€” Instant Actions | assets_resources_icons_postloginmidsection_sendmoney.png |
| UPI â€” Instant Actions | assets_resources_icons_postloginmidsection_upi.png |
| Bills & Recharge â€” Instant Actions | assets_resources_icons_postloginmidsection_bills.png |
| Open FD/RD â€” Instant Actions | assets_resources_icons_postloginmidsection_fdrd.png |
| Govt. Plans / Govt. Schemes â€” shortcut family | assets_resources_icons_postloginmidsection_government.png |
| Prasad Seva â€” shortcut family | assets_resources_icons_postloginmidsection_prasad.png |
| Loans â€” shortcut family | assets_resources_icons_postloginmidsection_loans.png |
| Invest â€” shortcut family | assets_resources_icons_postloginmidsection_invest.png |
| Shoppe/cart â€” bottom bar | assets_resources_icons_postloginbottombar_profile.png (the filename says profile; the artwork is a cart and the supplied screenshot labels it Shoppee/Shoppe) |
| Offers â€” bottom bar | assets_resources_icons_postloginbottombar_offers.png |
| Scan & Pay â€” raised bottom action | assets_resources_icons_postloginbottombar_scan.png |
| Credit Card â€” bottom bar | assets_resources_icons_postloginbottombar_creditcard.png |
| Emergency â€” bottom bar | assets_resources_icons_postloginbottombar_emergency.png |
| Security â€” additional bottom-bar resource | assets_resources_icons_postloginbottombar_security.png (not one of the five bottom items visible in the supplied screenshot) |
| Shoppe page/imagelist artwork | assets_resources_images_imagelists_pnb_shopee.png |

### Category header artwork

| Category | Extracted resource |
|---|---|
| Pay & Transfer | assets_resources_icons_allservices_pay.png |
| Manage Cards / Cards | assets_resources_icons_allservices_cards.png |
| Cheque | assets_resources_icons_allservices_cheque.png |
| Tax Related | assets_resources_icons_allservices_tax.png |
| Others | assets_resources_icons_allservices_other.png |

### Send Money child-group artwork

| Send Money area | Extracted resource |
|---|---|
| Self (Own Account) | assets_resources_icons_sendmoney_self.png |
| Payee (Added) | assets_resources_icons_sendmoney_payee.png |
| One Time (Bank) | assets_resources_icons_sendmoney_onetime.png |
| UPI (Payments) | assets_resources_icons_sendmoney_upi.png |
| Send Money Outside India | assets_resources_icons_sendmoney_outside.png |
| Send Money Nepal | assets_resources_icons_sendmoney_nepal.png |
| Cardless Cash | assets_resources_icons_sendmoney_cardless.png |
| To Other Sukanya Samridhi | assets_resources_icons_sendmoney_tosukanya.png |
| To PPF Account | assets_resources_icons_sendmoney_toppf.png |

### Other named page/service illustrations

| Feature | Candidate extracted image(s) | Qualification |
|---|---|---|
| Bill Payment | assets_resources_images_imagelists_bill_payment.png, bill_recharge.png | Named page/feature artwork; screenshot confirms the Bill Payments tile, not the exact file-to-tile binding. |
| Cardless Cash Withdrawal | assets_resources_images_imagelists_card_less_cash_withdrawal.png, card_less_cash__withdrawal.png | Named feature illustrations; Send Money â€œCardless Cashâ€ also has its own icon above. |
| Manage Debit Card | assets_resources_icons_prelogin_managedebitcard.png, assets_resources_images_imagelists_debitcard.png | Named/manage-card imagery; exact Services tile association not recovered. |
| Apply Virtual Card | assets_resources_images_imagelists_virtual_card_img.png | Named page illustration; exact tile glyph association not recovered. |
| Credit Card Against FD | assets_resources_images_imagelists_credit_card_against_fd.png, credit_card__against_fd.png | Direct feature-name match. |
| Cheque Book request | assets_resources_images_imagelists_request_chequebook.png | Direct feature-name match. |
| Positive Pay | assets_resources_images_imagelists_positive_pay.png, positive_pay_img.png | Direct feature-name match. |
| View/Stop Cheque | assets_resources_images_imagelists_view_stop_cheque.png, track_cheque.png | Direct feature-name match. |
| Form 121 (erstwhile 15G/H) | String table references Form_15_GH_IMG.png | The decoded drawable-mdpi file is assets_resources_images_imagelists_form_15_gh_img.png. Hermes strings label Form 121 (erst. Form 15G/H). |
| Form 16 | assets_resources_images_imagelists_form_16.png | Direct filename match. |
| Change Home Branch | assets_resources_images_imagelists_change_home_branch.png | Direct filename match. |
| Register/Update Nominee | assets_resources_images_imagelists_register_nominee_img.png, add_nominee.png, add_nominee123.png | Named nominee artwork; exact tile-to-file association not recovered. |
| Complaint / digital transaction complaint | digital_transaction_complaint.png, lodge_complaint.png, trackcomplaint.png | Named complaint/help artwork; exact tile-to-file association not recovered. |
| Generate Pension Slip | assets_resources_images_imagelists_pension_slip_generator.png | Direct filename match. |
| MPassbook | assets_resources_icons_prelogin_m_passbook.png, prelogin_mpassbook.png, assets_resources_images_imagelists_mpassbook_img.png | Direct filename match; variants differ in size/illustration role. |
| View Other Bank Account | assets_resources_icons_prelogin_viewotherbnkac.png, assets_resources_images_imagelists_otherbank.png | Direct filename match; exact tile placement not recovered. |
| Calculator | assets_resources_icons_prelogin_calculator.png, prelogin_navcalculator.png, assets_resources_images_imagelists_calculator.png, calculator1.png | Direct filename match; multiple variants. |
| Rewards / Reward Points | res/drawable/rewards.png, CCMS assets/images/icons/rewards.png, CCMS assets/images/drawer_icons/reward.png | Reward artwork exists in several modules; exact Reward Points Services tile binding is not proven. |

The extracted Loans category icons are also explicitly named: assets_resources_icons_loans_education_loan.png, loans_home_loan.png, loans_od_against_fd.png, loans_papl.png and loans_vehicle_loan.png. The Invest and Government Schemes page icon mapping is documented separately in the existing APK asset inventory and preceding reconstruction step.

## 5. The 54 numbered service icons

The decoded base contains assets_resources_images_imagelists_serviceicon_1.png through serviceicon_54.png (54 separate PNG files). They are small red-line service glyphs and are included as a visual reference sheet:

- docs/reference-assets/serviceicon-numbered-contact-sheet.jpg

The contact sheet is a visual inventory only. It does not establish that icon 1 is Fund Transfer, icon 2 is Bill Payment, etc. The current targeted Hermes decompilation exposes the tile component and dynamic catalogue functions, but not the data map that ties each serviceIcon_N to an exact service title. They were initially left unassigned; the implementation addendum below records only glyphs with clear matches to supplied screenshots.

A second contact sheet of named resource files is saved as:

- docs/reference-assets/named-service-assets-contact-sheet.jpg

## 6. Audit of all 64 requested entries

**Evidence key**
- **A â€” screenshot:** label and placement are visible in one of the six supplied screenshots.
- **B â€” named resource:** a matching named APK image or category resource exists, but exact runtime tile binding/page placement may not be screenshot-backed.
- **C â€” text/action ID:** exact label or AllSvc_* action identifier exists in Hermes strings; no uniquely matched standalone icon is established.
- **D â€” unassigned icon family:** a tile is visible/identified, but the only plausible small glyph is one of the 54 numbered service icons and there is no recovered item-to-icon crosswalk.
- **Partial:** more than one evidence kind applies; see the notes.

| # | Requested item | Page / section supported by source | Extracted icon/logo evidence | Grade and audit note |
|---:|---|---|---|---|
| 1 | Send Money | Dashboard â†’ Instant Actions; separate Send Money page | postloginmidsection_sendmoney.png; Send Money page uses the Self/Payee/One Time/UPI icons | A+B |
| 2 | UPI | Dashboard â†’ Instant Actions; Services â†’ Pay & Transfer; Send Money â†’ UPI (Payments) | postloginmidsection_upi.png; sendmoney_upi.png; CCMS ic_upi_logo.svg and BHIM/provider SVGs | A+B |
| 3 | Bills & Recharge | Dashboard â†’ Instant Actions; Services â†’ Pay & Transfer | postloginmidsection_bills.png; bill/recharge page illustrations | A+B |
| 4 | Open FD/RD | Dashboard â†’ Instant Actions; Invest page supports fdrd_only header mode | postloginmidsection_fdrd.png; Invest open-FD, open-RD and flexi-RD icons | A+B |
| 5 | Govt. Plans | Dashboard shortcut; Government Schemes page | postloginmidsection_government.png; seven named Government Schemes category icons | A+B |
| 6 | Prasad Seva | Dashboard shortcut | postloginmidsection_prasad.png | A+B |
| 7 | Loans | Dashboard shortcut; Loans screen/flow identifiers | postloginmidsection_loans.png; five named Loans category icons | A+B |
| 8 | Invest | Dashboard shortcut; separate Invest page | postloginmidsection_invest.png; Invest page named category icons | A+B |
| 9 | Scan & Pay QR | Dashboard raised bottom navigation action | postloginbottombar_scan.png; separate prelogin scan artwork; SDK also has QR assets | A+B |
| 10 | Shopee / Shoppe | Dashboard bottom navigation; separate Shoppe imagery | Cart glyph resource postloginbottombar_profile.png appears at Shoppe slot in screenshot; pnb_shopee.png is separate Shoppe page image | A+B; resource filename â€œprofileâ€ is misleading relative to the screenshot |
| 11 | Offers | Dashboard bottom navigation | postloginbottombar_offers.png; other Offers illustrations exist | A+B |
| 12 | Credit Card | Dashboard bottom navigation; other card/service screens | postloginbottombar_creditcard.png; card images exist | A+B |
| 13 | Emergency | Dashboard bottom navigation | postloginbottombar_emergency.png; Emergency illustrations also exist | A+B |
| 14 | Pay & Transfer | Services â†’ expandable category; screenshot shows expanded state | allservices_pay.png | A+B |
| 15 | Manage Cards | Services category label/resource family | allservices_cards.png; manage-card navigation/prelogin assets | B; category icon exists, expanded page not screenshot-backed |
| 16 | Cheque Service(s) | Services category; Cheque Services child list documented in Hermes strings | allservices_cheque.png; child-specific cheque assets below | B; category icon exists; child group is text-evidenced |
| 17 | Tax Related | Services category; string Tax Related Services | allservices_tax.png; tax/GST/Form illustrations exist | B; category icon exists; full expanded list not recovered |
| 18 | Others | Services category; Other Services references in strings | allservices_other.png | B; category icon exists; complete child list not recovered |
| 19 | Fund Transfer | Services - Pay and Transfer (visible tile) | serviceicon_1.png | A+B; direct visual match to supplied Services screenshot |
| 20 | Bill Payment(s) | Services - Pay and Transfer (visible tile); AllSvc_BillPayment | serviceicon_2.png; named bill/recharge page illustrations remain separate | A+B; direct visual match to supplied Services screenshot |
| 21 | Generate QR | Services - Pay and Transfer (visible tile); AllSvc_GenerateQR | service-generate-qr.png; cropped from the exact visible QR glyph in source screenshot 3.webp | A; screenshot-derived crop, not standalone APK resource |
| 22 | Approve to Pay | Services - Pay and Transfer (visible tile); AllSvc_ApproveToPay | service-approve-to-pay.png; cropped from the exact visible rupee/check glyph in source screenshot 3.webp | A; screenshot-derived crop, not standalone APK resource |
| 23 | Pay to Mobile Number | Services - Pay and Transfer (visible tile); AllSvc_PayToMobileNumber | service-pay-to-mobile.png; cropped from the exact visible rupee/arrow glyph in source screenshot 3.webp | A; screenshot-derived crop, not standalone APK resource |
| 24 | Manage Beneficiary | Services - Pay and Transfer (visible tile); AllSvc_ManageBeneficiary | serviceicon_4.png | A+B; direct visual match to supplied Services screenshot |
| 25 | Pay to Contact | Services - Pay and Transfer (visible tile); AllSvc_PayToContact | serviceicon_9.png | A+B; direct visual match to supplied Services screenshot |
| 26 | Standing Instructions | Services - Pay and Transfer (visible tile); AllSvc_StandingInstructions | serviceicon_10.png | A+B; direct visual match to supplied Services screenshot |
| 27 | My Transactions | Services - Pay and Transfer (visible tile); AllSvc_MyTransactions | serviceicon_8.png | A+B; direct visual match to supplied Services screenshot |
| 28 | View/Generate MMID | Services - Pay and Transfer (visible, truncated label); AllSvc_ViewGenerateMMID | serviceicon_52.png | A+B; direct visual match to supplied Services screenshot |
| 29 | Check IMPS Status | Services - Pay and Transfer (visible tile); AllSvc_CheckImpsStatus | service-check-imps.png; cropped from the exact visible IMPS/check glyph in source screenshot 3.webp | A; screenshot-derived crop, not standalone APK resource |
| 30 | PM Care | Services - Pay and Transfer (visible tile); AllSvc_PmCare | serviceicon_11.png | A+B; direct visual match to supplied Services screenshot |
| 31 | Cardless Cash Withdrawal | Send Money - Others; AllSvc_CardlessCashWD | serviceicon_6.png for Services tile; sendmoney_cardless.png for Send Money section | A+B; screenshot match and exact named Send Money asset |
| 32 | Manage Debit Cards | Services/cards management text and navigation references | prelogin_managedebitcard.png; debit-card illustrations and curated navigation manage_card.png | B; exact menu tile binding not screenshot-backed |
| 33 | Set Debit Card PIN | Exact string Set Debit Card PIN | Generic PIN-change/reset assets exist, but no uniquely identified debit-card-PIN menu icon | C |
| 34 | Track Status | Exact label Track Status in string table | No exact standalone named icon established; do not conflate with Track Service Request | C |
| 35 | Apply Debit Card | AllSvc_ApplyDebitCard | Related debit-card artwork exists, but no unique Apply Debit Card menu icon mapping recovered | C; card illustrations are not proven to be the tile glyph |
| 36 | Apply Virtual Card | AllSvc_ApplyVirtualCard | virtual_card_img.png; curated virtual_card.png navigation image | B; page illustration/related navigation artwork, exact tile binding unknown |
| 37 | Credit Card Against FD | AllSvc_CreditCardAgainstFD | credit_card_against_fd.png and credit_card__against_fd.png | B |
| 38 | Pre-qualified | AllSvc_PreQualifiedCC | No exact named menu icon found | C |
| 39 | MCWTC | AllSvc_MCWTC | No exact named menu icon found | C |
| 40 | Cardless Cash Withdrawal (duplicate of #31) | Same feature/action as #31 | Same named resources as #31 | Duplicate entry; no second unique menu icon established |
| 41 | Apply for Cheque Book | Cheque Services group, item (a) in extracted help text | request_chequebook.png | B; group membership is text-evidenced |
| 42 | Positive Pay Service | Cheque Services group, item (e) in extracted help text | positive_pay.png, positive_pay_img.png | B; group membership is text-evidenced |
| 43 | View/Stop Cheque | Cheque Services group, item (c) in extracted help text | view_stop_cheque.png, track_cheque.png | B; group membership is text-evidenced |
| 44 | Destroy Cheque | Cheque Services group, item (d) in extracted help text | No specifically named Destroy Cheque icon established | C; generic/numbered icon not assigned |
| 45 | PNB Suraksha | Cheque Services group, item (f) in extracted help text | No specifically named PNB Suraksha tile icon established; cheque-authentication action identifier is present | C; group membership is text-evidenced |
| 46 | GST Invoice | Tax-related strings include GST Invoice | gst_sahay_img.png | B/C; named GST illustrations, exact tile mapping not confirmed |
| 47 | Form 26 AS | String labels View Form 26 AS and Form 26 AS; Tax Related Services label also exists | No exact Form 26 AS icon located | C |
| 48 | Form 121 | String labels Form 121 (erst. Form 15G/H) and Form 121 Details | form_15_gh_img.png (legacy Form 15G/H resource) | B; legacy-name relation is explicit in the string and the matching Form 15G/H drawable is present |
| 49 | Form 16 | Exact Form 16 string and image filename | form_16.png | B |
| 50 | ITR e-filing | Exact ITR e-filing strings | No exact named standalone icon found | C |
| 51 | Form 131 | Exact Form 131 (erst. Form 16A) string | No exact named Form 131/16A image found | C |
| 52 | Register/Update Nominee | Exact string; help text explicitly references Other Services - Register/Update Nominee | register_nominee_img.png, add_nominee.png, add_nominee123.png | B; Other Services relationship is explicitly text-evidenced |
| 53 | Change Home Branch | Exact service image resource name | change_home_branch.png | B |
| 54 | Reward Points | Exact Reward Points string | Rewards artwork exists in base/CCMS resources (res/drawable/rewards.png, CCMS rewards images, drawer_icons/reward.png); no direct menu tile binding confirmed | B/C |
| 55 | Family Banking | Exact Family Banking string and workflow references | No clearly named Family Banking menu icon located | C |
| 56 | AEPS Enable/Disable | Exact AEPS_Enable_Disable string/action | No uniquely named AEPS menu icon located | C |
| 57 | MPassbook | Exact MPassbook string variants | prelogin_m_passbook.png, prelogin_mpassbook.png, mpassbook_img.png | B |
| 58 | Complaint Management | Exact Complaint Management and complaint flow references | digital_transaction_complaint.png, lodge_complaint.png, trackcomplaint.png | B/C; exact menu tile binding not confirmed |
| 59 | Generate Pension Slip | Exact Generate Pension Slip string | pension_slip_generator.png | B |
| 60 | Locker | Exact Locker string and locker action identifiers | No distinct named Services menu icon established | C |
| 61 | Track Service Request | Exact label and help text references | Curated navigation icon track_service.png; no screenshot of this entry | B/C |
| 62 | Personal Finance Manager | Exact Personal Finance Manager string | No uniquely named matching icon located | C |
| 63 | View Other Bank Account | Exact string and similarly named resource | prelogin_viewotherbnkac.png, otherbank.png | B |
| 64 | Calculator | Exact Calculator string | prelogin_calculator.png, prelogin_navcalculator.png, calculator.png, calculator1.png | B; several icon/illustration variants |

## 7. What is confirmed vs. what remains unresolved

### Confirmed by screenshot and/or extracted named resources
- Dashboard's four Instant Actions and five visible bottom navigation entries.
- Services screen's expandable category layout and all 14 visible Pay & Transfer labels.
- Send Money's three sections and the self/payee/one-time/UPI, international and Others item groups.
- Named top-level artwork for Pay & Transfer, Cards, Cheque, Tax Related and Others.
- Named resource files for the listed Dashboard shortcuts, Invest, Government Schemes, loans, cheque actions, card features, GST/tax, passbook, nominee, complaint, pension slip, calculator and other features listed in the matrix.
- Exact AllSvc_* action identifiers for a large subset of individual menu items.
- A Cheque Services child list of six entries; and the Other Services â†’ Register/Update Nominee reference.

### Not recovered to an exact standard
1. The full Services category/item tree for every item in the 64-item request.
2. The exact serviceIcon_1â€¦54 to menu-label crosswalk.
3. Exact icon file-to-tile binding for many of the Pay & Transfer screenshot tiles.
4. Expanded screenshot/page layouts for Manage Cards, Cheque Services, Tax Related Services and Others.
5. Full modal/flow details and exact navigation destinations for every tile.
6. Pixel dimensions, colors and source assets for every individual action tile. The existing six screenshots do not cover those details.

The main obstacle is not simply that the images are missing: the dynamic Services data mapping is not included in the saved targeted decompilation. The four glyphs visible in the supplied Services screenshot are now mapped from screenshot crops. More filesystem searching cannot safely turn an unlabelled serviceIcon_N into a named service. The next evidence needed for a complete crosswalk would be either the missing runtime/service configuration data or screenshots of each expanded category and its pages (including the icon labels).

## 8. Scope and safety

- This report uses the supplied APK extraction as its evidence base.
- No icon was invented or redrawn.
- No app UI, page, component, route, backend or business logic was edited.
- No PNB/NPCI/payment/banking API was connected or invoked.
- The source APK and decoded extraction were read-only during this audit.
- Temporary contact sheets were moved into docs/reference-assets/; they are reference documentation only, not app assets.



## 8. Mapping implementation addendum â€” 2026-11-04

The earlier audit correctly left the numbered icon family unassigned because the recovered bundle did not contain a service-title crosswalk. During implementation, the six supplied reference screenshots and the numbered contact sheet were compared visually. This supports a limited screenshot-based mapping for visible items; it does not establish the mapping for all 54 files.

### Numbered glyphs now used in PNB-UPDATE

| APK glyph | Applied to | Evidence |
|---|---|---|
| serviceicon_1 | Services â€” Fund Transfer | Direct visual match in Services screenshot |
| serviceicon_2 | Services â€” Bill Payments | Direct visual match in Services screenshot |
| serviceicon_3 | Services â€” UPI | UPI mark matches screenshot |
| serviceicon_4 | Services â€” Manage Beneficiary | Direct visual match in Services screenshot |
| serviceicon_6 | Services â€” Cardless Cash Withdrawal | Direct visual match in Services screenshot |
| serviceicon_8 | Services â€” My Transactions; Profile â€” My Transaction | Visual match to rupee/transaction glyph |
| serviceicon_9 | Services â€” Pay to Contact; Profile â€” Set User ID | Visual match to contact/ID glyph |
| serviceicon_10 | Services â€” Standing Instructions | Direct visual match in Services screenshot |
| serviceicon_11 | Services â€” PM Care | Direct visual match to group/people glyph |
| serviceicon_18 | Profile â€” Reward Points | Visual match to rewards/coins glyph |
| serviceicon_31 | Profile â€” E-Statement Deregistration | Direct visual match to document/remove glyph |
| serviceicon_33 | Profile â€” E-Statement Registration | Direct visual match to document/rupee glyph |
| serviceicon_45 | Profile â€” Account Statement | Visual match to statement/rupee document glyph |
| serviceicon_47 | Profile â€” Check KYC Status | Visual match to verified-user glyph |
| serviceicon_48 | Profile â€” Safety Ring | Direct visual match to shield glyph |
| serviceicon_52 | Services â€” View/Generate MMID | Visual match to document/lookup glyph |

The Pay & Transfer group header uses the separately named `allservices_pay.png` asset. Dashboard, Send Money and the other Profile group-header artwork use their named APK resources, as listed in `PNB-ONE-4.43-MAPPING-IMPLEMENTATION.md`.

### Remaining unknowns

- 38 of the 54 numbered glyphs have not been assigned to a title and are not used by PNB-UPDATE.
- The four remaining Pay & Transfer screenshot glyphs are now applied using direct crops from screenshot 3.webp; they are not misrepresented as standalone extracted APK resources.
- Profile tile mappings not listed above remain unchanged.
- Named page illustrations are not substituted for small menu glyphs merely because their filenames are similar.
- The Cards, Cheque, Tax Related and Others category icons exist, but their expanded runtime screens were not supplied. No expanded item tree is inferred from category art alone.
