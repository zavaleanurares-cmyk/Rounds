/**
 * Bundled legal copy — the fallback behind the remote-hosted versions.
 *
 * These are required before submission to either store, so they ship in the
 * binary rather than behind a fetch. The app must never have a dead link where
 * its terms should be, including at review time with the network stubbed.
 *
 * THIS IS A DRAFT FOR COUNSEL, NOT ADVICE. Do not ship without a review.
 *
 * Every section below is in its FINAL structure: the headings are the ones the
 * published documents will carry, in the order they will carry them, and the
 * substantive position is already taken. What remains inside a [DRAFT — …]
 * marker is a decision only a lawyer can make — an entity name, a liability
 * cap, a governing law, a transfer mechanism — stated as a specific question
 * rather than as a gap.
 *
 * That distinction is the point of this file. A lawyer reviewing a document
 * charges for reading; a lawyer drafting one charges for writing. Handing over
 * "[DRAFT — governing law TBD]" buys a blank page back. Handing over a complete
 * clause with the one unresolved variable marked, and the market-by-market
 * question asked next to it, buys an edit.
 *
 * The markers and the in-app banner stay until counsel signs off. The banner is
 * driven by the presence of "[DRAFT" in any section body (see
 * `app/legal/[doc].tsx`), so removing a marker is what removes the warning —
 * they cannot fall out of step.
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
        heading: 'Payments',
        body: 'ROUNDS is currently free and offers nothing for sale. There is no subscription, no in-app purchase and no price anywhere in the app. Safety features are free forever and will never be placed behind a payment of any kind. [DRAFT — this clause is written for the app AS SHIPPED. If a paid tier is introduced, replace this section with the subscription terms in the drafting note below rather than amending this one, and give the 30 days\' notice required by "Changes to these terms".] [DRAFT — subscription terms to reinstate when billing ships: automatic renewal until cancelled; cancellation and refunds handled by the App Store or Google Play under their own policies and not by us; the EU/UK 14-day statutory right of withdrawal and how it is exercised through the store; and confirmation that safety remains outside any paid tier.]',
      },
      {
        heading: 'Our intellectual property, and yours',
        body: 'The ROUNDS name, the app, its interface, its artwork and its drink illustrations are ours and are licensed to you for personal, non-commercial use of the app. You keep everything you write and upload. By posting content into a shared night or a crew you give us a licence to store it and show it to the people you shared it with, for as long as you keep it there and no longer. [DRAFT — counsel to set the licence wording, confirm whether a broader licence is needed for any promotional use (we would prefer not), and check the trade-mark position for "ROUNDS" in each launch market.]',
      },
      {
        heading: 'Liability',
        body: 'ROUNDS is provided as-is and as-available. To the fullest extent the law allows we exclude implied warranties and we are not liable for indirect or consequential loss, loss of profit, or loss of data. Our total liability to you for all claims in any twelve-month period is limited to [DRAFT — cap to be set by counsel: the amount you paid us in that period, or a fixed floor for a free user, or both, whichever is appropriate per market]. Nothing in these terms limits or excludes liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot lawfully be limited. If you are a consumer, your statutory rights are unaffected and nothing here overrides them. [DRAFT — counsel to confirm the exclusion list survives the UK Consumer Rights Act 2015 and the EU Unfair Terms Directive in each launch market, and to advise whether a separate business-user clause is needed.]',
      },
      {
        heading: 'Law and disputes',
        body: 'Before anything formal, write to hello@rounds.app; most things are settled that way and we will reply within [DRAFT — response window, counsel to set]. These terms are governed by the law of [DRAFT — governing law, counsel to set], and the courts of [DRAFT — forum, counsel to set] have jurisdiction. If you are a consumer resident in the EU or the UK, this does not deprive you of the protection of the mandatory rules of your own country, and you may bring proceedings in your own courts. EU consumers may also use the European Commission\'s online dispute resolution platform at ec.europa.eu/consumers/odr. [DRAFT — counsel to set governing law and forum per launch market, confirm the ODR link is still required and current at the time of publication, and advise whether an arbitration clause and class-action waiver are appropriate for the United States and enforceable given the consumer position elsewhere.]',
      },
      {
        heading: 'Changes to these terms',
        body: 'We may change these terms. Material changes are notified in the app at least 30 days before they take effect, and continuing to use ROUNDS after that date is acceptance. If you do not accept a change, you can delete your account from Settings › Data & account and your data is removed under the policy below.',
      },
      {
        heading: 'Contact',
        body: 'ROUNDS is operated by [DRAFT — full legal entity name and registered address, which must match the Privacy Policy and both store listings exactly]. Write to hello@rounds.app about anything, or privacy@rounds.app about your data; we answer at the address you write from. Reports of harassment or of anything that puts a person at risk are reviewed by a person, usually within 24 hours, and you can also report from any profile inside the app.',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED,
    sections: [
      {
        heading: 'Who we are',
        body: 'The controller of the personal data described in this policy is [DRAFT — full legal entity name], a [DRAFT — company form, e.g. SRL] registered in [DRAFT — country of registration] under number [DRAFT — company registration number], at [DRAFT — registered address]. You can reach us at privacy@rounds.app. [DRAFT — counsel to confirm whether a Data Protection Officer is required under Article 37 and, if so, add their contact details here; and whether an Article 27 EU representative and a UK representative are required, adding each with a postal address. These same details must match the store listings and the Terms.]',
      },
      {
        heading: 'The short version',
        body: 'We store what you log so the app can show it back to you. The blood-alcohol estimate is worked out on your phone and never sent anywhere. Friends can see that you were out, never what you drank. We do not sell your data, we do not share it for advertising, and there is no advertising in ROUNDS. You can export everything or delete your account from Settings › Data & account, immediately and without asking us.',
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
        heading: 'Legal bases',
        body: 'Contract: your profile, your logs, your nights, your plans and your settings — we cannot provide the app without them. Explicit consent (Article 9(2)(a)): your sex and weight, which are health-related and are used only to compute the pace estimate on your device; withdraw it by clearing those fields, which stops the estimate and nothing else. Legal obligation: your date of birth, to verify legal drinking age. Legitimate interests: keeping the service secure, preventing abuse, and diagnostic events that carry counts and categories only — you can object to the last of these in Settings › Privacy. [DRAFT — counsel to confirm the Article 9 basis for body data and whether a legitimate-interests assessment should be recorded and summarised here.]',
      },
      {
        heading: 'Subprocessors',
        body: 'Supabase — database, authentication and file storage, hosted in the EU. Expo — push notification delivery. [DRAFT — SMS provider name], used only to send a safe-arrival escalation to the contacts you chose. [DRAFT — counsel to complete this list before launch, and for each entry record: the processor\'s legal name, what it processes, where it processes it, and the transfer mechanism for anything outside the EEA or the UK (Standard Contractual Clauses plus a transfer impact assessment, or an adequacy decision). Counsel to advise on publishing this list at rounds.app/subprocessors with a commitment to give notice before a new processor is added, which is the form enterprise reviewers and the stores expect.]',
      },
      {
        heading: 'How we protect it',
        body: 'Data is encrypted in transit and at rest. Access to your rows is enforced by the database itself rather than by the app, so a bug in the client cannot show your data to someone else. Nobody at ROUNDS reads your logs. [DRAFT — counsel to confirm the breach-notification wording required by Articles 33 and 34, and whether a specific commitment on notification timing should appear here.]',
      },
      {
        heading: 'No profiling, no automated decisions',
        body: 'Nothing in ROUNDS makes a decision about you with legal or similarly significant effect, and we do not profile you for advertising. The pace estimate and the wellbeing prompts are calculated on your own device from what you logged, and they are information for you, not a judgement recorded about you.',
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
        heading: 'Changes to this policy',
        body: 'If we change this policy materially we will tell you in the app before the change takes effect, and the date at the top of this page always reflects the current version.',
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
