import type { Message } from '../../types';

/** A-04…A-12 · The first run: age gate, identity, region, body, intent, modules, push, ready. */
export const onboarding = {
  // shared
  'onboarding.continue': 'Continue',

  // A-04 · Age gate
  'onboarding.ageTitle': 'When were you born?',
  'onboarding.ageSubtitle':
    'ROUNDS is for people of legal drinking age. We check once and keep the answer.',
  'onboarding.day': 'Day',
  'onboarding.month': 'Month',
  'onboarding.year': 'Year',
  'onboarding.ageNote': '18+ in the EU, UK and Romania · 21+ in the United States.',
  // The wheel shows abbreviated months, which are not the same three letters
  // everywhere — "Jan" is "ian" in Romanian and "ene" in Spanish.
  'onboarding.monthJan': 'Jan',
  'onboarding.monthFeb': 'Feb',
  'onboarding.monthMar': 'Mar',
  'onboarding.monthApr': 'Apr',
  'onboarding.monthMay': 'May',
  'onboarding.monthJun': 'Jun',
  'onboarding.monthJul': 'Jul',
  'onboarding.monthAug': 'Aug',
  'onboarding.monthSep': 'Sep',
  'onboarding.monthOct': 'Oct',
  'onboarding.monthNov': 'Nov',
  'onboarding.monthDec': 'Dec',

  // A-12 · Underage block
  'onboarding.blockedTitle': "ROUNDS isn't for you yet",
  'onboarding.blockedBody':
    "You need to be of legal drinking age in your region to use ROUNDS. We're keeping this answer, so there's nothing to try again here.",
  'onboarding.blockedLink': 'Information about alcohol and young people',

  // A-05 · Identity
  'onboarding.identityTitle': 'Who are you?',
  'onboarding.identitySubtitle': 'Your friends will see this. Nothing else is public.',
  'onboarding.monogramNote': 'Skip the photo and you get a coloured monogram.',
  'onboarding.displayName': 'Display name',
  'onboarding.displayNamePlaceholder': 'Rareș',
  'onboarding.username': 'Username',
  'onboarding.usernamePlaceholder': 'rares',
  'onboarding.usernameChecking': 'Checking…',
  'onboarding.usernameTaken': 'Someone already has that one.',
  'onboarding.usernameInvalid': '3–20 characters, letters, numbers and underscores.',
  'onboarding.usernameFree': 'Yours.',
  'onboarding.usernameHint': 'How friends find you.',

  // A-07 · Region and units
  'onboarding.regionTitle': 'Where are you drinking?',
  'onboarding.regionSubtitle': "A 'unit' means different things in different places. Pick yours.",
  'onboarding.standardDrink': 'Standard drink',
  'onboarding.unitSystem': 'Unit system',
  'onboarding.unitSystemEU': 'EU',
  'onboarding.unitSystemUK': 'UK',
  'onboarding.unitSystemUS': 'US',
  'onboarding.standardDrinkUS': 'One drink = {grams}g of alcohol.',
  'onboarding.standardDrinkUnit': 'One unit = {grams}g of alcohol.',
  'onboarding.standardDrinkNote':
    'Everything you log is stored in grams and converted here, so changing this later never rewrites your history.',
  'onboarding.currency': 'Currency',
  'onboarding.currencyNote':
    "Spend is the number people actually moderate for. It's optional on every log.",

  // A-06 · Body basics
  'onboarding.bodyTitle': 'Body basics',
  'onboarding.bodySubtitle': 'Only used on this phone, only for the pace estimate.',
  'onboarding.skipThis': 'Skip this',
  'onboarding.sex': 'Sex',
  'onboarding.sexFemale': 'Female',
  'onboarding.sexMale': 'Male',
  'onboarding.sexUnspecified': 'Prefer not to',
  'onboarding.weight': 'Weight',
  'onboarding.decreaseWeight': 'Decrease weight',
  'onboarding.increaseWeight': 'Increase weight',
  'onboarding.weightUnitKg': 'kg',
  'onboarding.weightUnitLb': 'lb',
  'onboarding.bodyNote': 'Your pace ring gets a lot more accurate with this. You can add it any time.',

  // A-08 · Intent
  'onboarding.intentTitle': "What's this for?",
  'onboarding.intentSubtitle':
    "Pick what's true. It changes what we show you in week one, nothing else.",
  'onboarding.intentTrack': 'Keep track',
  'onboarding.intentSocial': 'Go out with people',
  'onboarding.intentEasier': 'Take it easier',
  'onboarding.intentNote': 'You can pick more than one, or none.',

  // A-09 · Modules
  'onboarding.modulesTitle': 'Anything else?',
  'onboarding.modulesSubtitle': 'Both optional. You can change these any time in Settings.',
  'onboarding.nicotineTitle': 'Nicotine tracking',
  'onboarding.nicotineSubtitle': 'Cigarettes, vapes and pouches, with cost and free-day streaks.',
  'onboarding.socialTitle': 'Social features',
  'onboarding.socialSubtitle':
    'Friends, crews, shared nights and plans. Turning this off makes ROUNDS entirely private.',
  'onboarding.modulesNote':
    'With social off you keep pace, spend, history and everything in Get home safe.',

  // A-10 · Notification primer
  'onboarding.permissionsTitle': "Three things we'd send",
  'onboarding.permissionsSubtitle': 'Never during a live night. Capped at three a week by default.',
  'onboarding.pushMorningTitle': 'Your morning after',
  'onboarding.pushMorningBody':
    'One push at your usual wake time, with the night and the gaps to fill.',
  'onboarding.pushSafetyTitle': 'Safe arrival',
  'onboarding.pushSafetyBody':
    'If you armed a check-in and the deadline passes, we ask you before we ask anyone else.',
  'onboarding.pushPlansTitle': 'Plans',
  'onboarding.pushPlansBody': 'When someone invites you or a plan is about to start.',
  'onboarding.allowNotifications': 'Allow notifications',
  'onboarding.notNow': 'Not now',
  'onboarding.androidNote':
    'Android will ask you next. Declining is fine — safety check-ins still work in the app.',

  // A-11 · Ready
  'onboarding.doneTitle': "You're set",
  'onboarding.doneSubtitle': 'Three things worth knowing before your first night.',
  'onboarding.takeMeIn': 'Take me in',
  'onboarding.markTonight':
    'Tonight changes shape through the night — plan, live, wind-down, morning.',
  'onboarding.markLog': 'The middle button logs a drink. From the lock screen it is one tap.',
  'onboarding.markSafety': 'Get home safe is reachable from anywhere and always free.',
} satisfies Record<string, Message>;
