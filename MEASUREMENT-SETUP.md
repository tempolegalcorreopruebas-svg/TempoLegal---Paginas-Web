# Measurement setup

Prepared 27 October 2026. This is code and an implementation plan, not a live Analytics installation. No account, campaign, tracking property or hosting setting has been changed.

## Activation prerequisites

Keep `measurement-config.js` disabled and `environment: 'staging'` until publication is approved. A real GA4 measurement ID has not been supplied. The client also refuses measurement on HTTP, unlisted hosts, pages with a noindex meta tag, or URLs containing `tempo_test`. Removing noindex is a separate final publication task, not part of this delivery. Do not remove the API's permanent noindex header when making public pages indexable.

The account owner must confirm the actual GA4 property, data processor settings and any linked destinations before activation. Use one installation: this delivery loads the Google tag directly, not a GTM container. Do not add a second GTM/GA snippet, a Hostinger tracking integration, a WordPress plugin tag or connected advertising tags in parallel. The source policy mentions GTM and other tools from the earlier setup; reconcile that inventory with the actual production deployment before publication, preserving the supplied approved original until a revised legal document is provided.

Before enabling this implementation in a real property:

1. Turn **Enhanced measurement off**, including automatic form interactions, outbound click events, site search, file downloads and automatic history/page-view tracking. Our code sends only its defined manual events. Turn off automatic user-provided data collection, Google signals, advertising personalisation and unneeded connected tags/destinations. Audit the actual tag responses and property settings; source code cannot configure or verify these account settings.
2. Set user/event data retention to **14 months**, matching Privacy 4.3, and turn off resetting retention on new activity. Aggregated reports have separate Google retention behaviour. Review processing terms and international recipient arrangements with the privacy lead.
3. Create an event-scoped custom dimension `contact_source` if the source breakdown is needed. Use the exact event names in `measurement-events.json`. Do not register a form name, visitor name, email, phone, enquiry, radar answer, mail reference or request ID as a dimension or User-ID.
4. Treat `formulario_aceptado` as acceptance by the SMTP server, not delivery to an inbox, an appointment, a qualified lead or revenue. The commercial owner must separately define key-event use and attribution. Do not import a WhatsApp click as a sale or automatically mark it as a qualified lead.
5. After the final legal and publication checks, enter the real `measurementId`, set `enabled: true`, and set `environment: 'production'`. Keep the host allowlist narrow. These values are public configuration, not server credentials.
6. Run the controlled production verification below. Configure internal/test traffic filtering in GA4 before the first real account verification and retain the evidence outside the public site. Changes to campaigns or ad conversion imports require a separate instruction.

## Behaviour and data minimisation

- The optional category is unchecked by default. There is no provider load, consent ping or event buffer until explicit analytics permission. This is basic consent mode; ads storage, ads user data and ad personalisation remain denied.
- A fresh analytics banner appears only when the configured production integration is eligible. This draft does not interrupt the visitor with a request to accept inactive Analytics. Privacy preferences are always accessible from the footer. Google Maps has a separate affirmative choice and can be used without accepting Analytics.
- Choice version `4.3-web-1`, category booleans and a timestamp are stored locally for 180 days. Old map-only choices, malformed values and expired choices are not reused as authorisation. Changes propagate between tabs. A long-open tab rechecks expiry once per minute.
- A click in the map placeholder enables maps only. Reject and withdraw deny all optional categories. Withdrawal clears accessible first-party `_ga` cookies, sets Google's disable flag before further events, removes the loader and reloads an active analytics page to unload executed vendor code. The reload can clear an unfinished form; save a draft before withdrawing. Map iframes unload immediately. The site cannot delete cookies belonging to Google domains or retrospectively delete data already received there.
- If local storage is unavailable, an affirmative choice works for the current document and the panel explains that it cannot remember it. A later page asks again where appropriate.
- The only custom contact parameter is the fixed enum `contact_source`: `floating`, `footer`, `inquiry`, `content`. Language is limited to ES/EN/PT/FR. `page_location` is the known canonical URL without its query or fragment, and `page_referrer` is blank. No campaign query strings or WhatsApp message text are forwarded. This intentionally limits campaign attribution; add only an approved, allowlisted campaign mapping in a future scope.
- Google still receives network/technical data when its Analytics library is authorised. The absence of enquiry fields does not make analytics anonymous or remove privacy obligations.
- Google's library can additionally generate its normal session/first-visit/engagement events. These are not custom lead events; inspect their real network payloads during account validation. Turning enhanced measurement off does not mean that every technical GA event disappears.
- One manual page view per document; rapid WhatsApp activations are suppressed for 1.5 seconds. Form acceptance uses the local request ID for in-memory deduplication, then discards it from the analytics payload. Earlier interactions are never replayed after consent.
- A provider/network failure does not create a fictitious recorded event or trigger retries. Browser reloads and a new prepared enquiry are new contexts. This is not cross-device attribution or a permanent CRM deduplication system.

## Excluding tests

Staging/preview, invalid or absent IDs, noindex pages and unlisted domains are excluded by default. On production, add `?tempo_test=1` to each test URL to exclude that document. For a persistent test-browser exclusion, set `localStorage.setItem('tempo-measurement-excluded', '1')` in that site's browser developer console and reload. Remove that key only when deliberately validating a separate QA stream; do not contaminate the live commercial figures. The setting is read at page load. GA4's own internal/developer traffic filters remain a separate account task.

## Production verification after approval

Use a controlled browser, a QA property/stream or established test-traffic filters and synthetic enquiry data. Record time, build, URL, consent state, browser and observed requests.

| Scenario | Expected result |
| --- | --- |
| First visit, no choice | No Google Analytics or map request |
| Reject optional | No provider request; content/contact remain usable |
| Maps only | Only the authorised map can load; no Analytics |
| Analytics only | One Google tag and one manual page view; no map |
| WhatsApp | One `clic_whatsapp`; no URL query or message in event parameters |
| Prepare enquiry / failed SMTP / validation error | No `formulario_aceptado` |
| Actual SMTP acceptance | One `formulario_aceptado`; verify mailbox arrival separately |
| Repeated successful response | No duplicate for the same prepared request on that document |
| Withdraw / change in another tab | Map unloads; no new Analytics events; active analytics document reloads |
| Provider blocked / cookies blocked | Site still usable; no invented metric or successful submission |
| Test marker / noindex / staging | No Analytics loader |

Inspect the complete request payload, not just the dataLayer. Confirm that remotely configured enhanced measurement, connected tags, automatic destinations or host-injected scripts do not collect extra data. Verify each locale on mobile and desktop. These live provider tests have not been run because no property ID, account access or production deployment was provided.

## Commercial measurement

`conversacion_real` and `lead_calificado` are commercial records, not browser events in this delivery. A person confirms an actual two-way exchange; a responsible specialist qualifies a lead using agreed fit/need/scope criteria. Assign one internal lead ID, record each transition once and retain evidence in the authorised CRM. Do not put personal records in the public project or automatically send them to Google. No CRM destination or offline conversion import has been configured.

Juan Mera is named in the supplied master as the measurement coordinator with Rubén and Antony. Ownership, access and qualification criteria still need operational confirmation; no message has been sent to any of them. Report event totals and commercial counts separately, with period, source and exclusions. Consent rejection, blockers, returning visitors, duplicates between channels and unattributed traffic prevent treating a simple click-to-lead ratio as a verified conversion rate.

## References

- Google: basic versus advanced consent mode: https://developers.google.com/tag-platform/security/concepts/consent-mode
- Google: configuration fields, manual page views and cookie controls: https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- Google: disabling Analytics and advertising features: https://developers.google.com/tag-platform/security/guides/privacy
- Google: enhanced measurement settings: https://support.google.com/analytics/answer/9216061?hl=en
- Google: data retention: https://support.google.com/analytics/answer/7667196?hl=en
