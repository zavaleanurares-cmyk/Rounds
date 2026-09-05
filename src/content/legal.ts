/**
 * Bundled legal copy — the fallback behind the remote-hosted versions.
 *
 * These are required before submission to either store, so they ship in the
 * binary rather than behind a fetch. The app must never have a dead link where
 * its terms should be, including at review time with the network stubbed.
 *
 * ⚠️ THIS IS A DRAFT FOR COUNSEL, NOT ADVICE. It is written to be complete
 * enough to review and specific enough to be useful — the alcohol-estimate
 * disclaimer, the GDPR articles, the retention periods and the subprocessor
 * list are the parts a lawyer will want to change, and they are called out so
 * they are easy to find. Do not ship without a review.
 */

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated: string;
  /** Shown at the top, so nobody mistakes a draft for a reviewed document. */
  draftNotice?: string;
  sections: LegalSection[];
}

const UPDATED = 'September 2026';

export const LEGAL: Record<string, LegalDoc> = {
  terms: {
    title: 'Terms of Service',
    updated: UPDATED,
    sections: [
      {
        heading: 'What ROUNDS is',
        body: 'ROUNDS is a nightlife companion. It records what you tell it, estimates your drinking pace, helps you keep your group together and helps you get home. It is not a medical device, not a breathalyser, and not a source of advice about whether you are fit to drive or operate anything.',
      },
      {
        heading: 'The pace estimate — read this one',
        body: 'Any blood-alcohol figure shown in ROUNDS is an ESTIMATE produced from what you logged, your body basics and population averages. It cannot account for food, medication, illness, individual metabolism, the strength of what you were actually poured, or a drink you forgot to log. It can be wrong in either direction and often is. Never use it to decide whether to drive, and never rely on it to decide whether you or anyone else is safe. If you have been drinking, do not drive.',
      },
      {
        heading: 'Safety features are not a safety service',
        body: 'The safe-arrival check-in sends a message to contacts you chose, if you do not check in. It is a convenience, not an emergency service. It depends on your phone, your battery, your signal and your contacts being reachable, and any of those can fail. It does not contact emergency services, and it is not monitored by anyone. In an emergency call 112 (EU/UK), 911 (US) or your local number.',
      },
      {
        heading: 'Age',
        body: 'ROUNDS is for adults of legal drinking age in their region — 18 in the EU, UK and Romania, 21 in the United States. We verify date of birth at sign-up and store the result on our servers, so reinstalling the app does not reset it. Providing a false date of birth is a breach of these terms and we will close the account.',
      },
      {
        heading: 'Your account and your conduct',
        body: 'You are responsible for what you post in shared nights and crew chats. Harassment, impersonation, content that sexualises minors, and anything that endangers a person are prohibited and will end the account. You can block and report anyone from their profile; reports are reviewed by a person, usually within 24 hours. You can delete your account at any time from Settings › Data & account.',
      },
      {
        heading: 'What we may do',
        body: 'We may suspend or close an account that breaches these terms, and we may remove content that does. We will tell you why unless doing so would put someone at risk or breach a legal obligation. We may change these terms; material changes are notified in the app at least 30 days before they take effect, and continuing to use ROUNDS after that is acceptance.',
      },
      {
        heading: 'Subscriptions',
        body: 'ROUNDS+ is optional. Safety features are free forever and are never placed behind a paywall. Subscriptions renew automatically until cancelled; manage or cancel them in your App Store or Google Play account, not here — we cannot cancel a store subscription on your behalf. Refunds are handled by the store under its own policy. EU and UK consumers have a statutory right to withdraw within 14 days; exercising it through the store is the fastest route.',
      },
      {
        heading: 'Liability',
        body: 'To the fullest extent the law allows, ROUNDS is provided as-is and we are not liable for indirect or consequential loss. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited. If you are a consumer, your statutory rights are unaffected. [DRAFT — a liability cap and a governing-law clause belong here; counsel to set both, and to confirm the position for consumers in each launch market.]',
      },
      {
        heading: 'Law and disputes',
        body: '[DRAFT — governing law and forum to be set by counsel per launch market. For EU consumers this cannot deprive them of the protection of their home jurisdiction, and the ODR platform must be linked.]',
      },
      {
        heading: 'Contact',
        body: 'hello@rounds.app',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED,
    sections: [
      {
        heading: 'Who we are',
        body: '[DRAFT — legal entity name, registered address and, where required, an EU representative under Article 27 GDPR.] We are the controller of the personal data described below. Contact: privacy@rounds.app.',
      },
      {
        heading: 'What we store, and why',
        body: 'Your profile (display name, username, avatar) so friends can find you — necessary to perform the contract. What you log, your nights, your plans and your settings — necessary to provide the service. Body basics (sex and weight), only if you give them, and only to compute the pace estimate on your device — this is health-related data and we process it solely on your explicit consent, which you can withdraw by clearing those fields. Date of birth, to verify legal drinking age — a legal obligation. Diagnostic events, which carry counts and categories and never the name of a drink, a venue or a person.',
      },
      {
        heading: 'What never leaves your phone',
        body: 'The blood-alcohol estimate is computed on your device and is never stored on our servers or transmitted anywhere. Contact matching hashes phone numbers on your device with a salt; only the hashes are sent, and we do not keep your contact list. Your home address, used to pre-fill a ride home, is stored on the device only.',
      },
      {
        heading: 'Location',
        body: 'Location is used to show venues near you and is not stored on our servers for that purpose. Sharing your live location with a night is opt-in per night, visible only to people in that night, and deleted automatically when the night ends — the row is removed, not merely hidden. We never request background location.',
      },
      {
        heading: 'Who else sees it',
        body: 'Nothing about your drinking is shared with anyone unless you share it. A friend can see that you were out and which venues, only if you set a night to friends-visible. A friend never sees what you drank, how much, your pace, your streaks or your spend. We do not sell personal data, we do not share it for advertising, and there is no advertising in ROUNDS.',
      },
      {
        heading: 'Subprocessors',
        body: 'Supabase (database, authentication and file storage, EU region), Expo (push notification delivery), and an SMS provider used only for safe-arrival escalation. [DRAFT — counsel to confirm the final list, the transfer mechanism for any processor outside the EEA, and to publish a subprocessor page with a change-notification commitment.]',
      },
      {
        heading: 'How long we keep it',
        body: 'Your logs and nights are kept until you delete them or delete your account. Deleting your account starts a 30-day grace period, after which everything is removed by a server-side cascade; you are signed out immediately. Live location expires within hours. Diagnostic events are kept for 12 months. Moderation reports are kept for 24 months so repeat behaviour can be recognised.',
      },
      {
        heading: 'Your rights',
        body: 'Under the GDPR and the UK GDPR you can access, correct, delete, restrict, object to and port your data. Export everything as JSON from Settings › Data & account — free, immediately, no request needed. Delete your account from the same screen. You can complain to your supervisory authority; in Romania that is ANSPDCP.',
      },
      {
        heading: 'Children',
        body: 'ROUNDS is not for anyone under the legal drinking age in their region and we do not knowingly collect data from them. If you believe a minor has an account, write to privacy@rounds.app and we will remove it.',
      },
      {
        heading: 'Support',
        body: 'If drinking is causing you problems, the Wellbeing screen links to support resources for your region. Nothing you tell ROUNDS is shared with anyone outside your account.',
      },
    ],
  },

  support: {
    title: 'Drinking support',
    updated: UPDATED,
    sections: [
      {
        heading: 'If it stops being fun',
        body: 'Talking to someone about drinking is a normal thing to do, and it does not have to be a crisis first. Your GP is a reasonable first call, and most countries have a free, confidential line.',
      },
      {
        heading: 'Romania',
        body: 'Alianța Română de Prevenire a Sinuciderii · 0800 801 200. Emergency: 112.',
      },
      {
        heading: 'United Kingdom & Ireland',
        body: 'Drinkline · 0300 123 1110. Alcoholics Anonymous · 0800 9177 650. Emergency: 999 / 112.',
      },
      {
        heading: 'European Union',
        body: 'Emergency: 112. Your national health service will list local alcohol services.',
      },
      {
        heading: 'United States',
        body: 'SAMHSA National Helpline · 1-800-662-4357, free and confidential, 24/7. Emergency: 911.',
      },
    ],
  },
};

export const LEGAL_DOCS = Object.keys(LEGAL);
