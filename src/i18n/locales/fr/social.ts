import type { Message } from '../../types';

export const social = {
  // Same word as common.tabCircle — this is the screen that tab opens.
  'social.title': 'Cercle',
  'social.notifications': 'Notifications',

  // night one
  'social.emptyTitle': "Personne ici pour l'instant",
  'social.emptyBody':
    "ROUNDS est meilleur avec les gens avec qui tu sors vraiment. Trouve-les par pseudo, ou cherche dans tes contacts — les numéros sont hachés sur ton téléphone et ne sont jamais envoyés.",
  'social.findPeople': 'Trouver des gens',
  'social.yourCode': 'TON CODE',
  'social.handle': '@{username}',
  'social.usernameFallback': 'toi',
  'social.shareIt': 'Partager',
  'social.shareMessage': 'Ajoute-moi sur ROUNDS : @{username}',

  // the list
  'social.friendRequests': {
    // French counts zero as singular, so "one" also covers 0.
    one: "{count} demande d'ami",
    other: "{count} demandes d'ami",
  },
  // "De sortie" is invariable, so it never genders the person it labels.
  'social.outRightNow': 'DE SORTIE EN CE MOMENT',
  'social.outNowLabel': '{name}, de sortie en ce moment',
  'social.outNow': 'de sortie',
  'social.crews': 'BANDES',
  'social.makeCrew': 'Créer une bande',
  // English keeps one wording for both forms; French inflects the noun.
  'social.friendsHeader': {
    one: 'AMI · {count}',
    other: 'AMIS · {count}',
  },
  'social.nightsTogether': {
    one: '{count} soirée ensemble',
    other: '{count} soirées ensemble',
  },
  'social.noNightsTogether': 'pas encore de soirée ensemble',
  'social.joinNight': 'Rejoindre une soirée',

  // C-02 · find people
  // "Pseudo" is the word profile.handleLabel already uses for the handle.
  'social.username': 'Pseudo',
  'social.usernamePlaceholder': 'anam',
  'social.rateLimited': "Tu as envoyé beaucoup de demandes aujourd'hui. Réessaie demain.",
  'social.handleCrews': '@{username} · {crews}',
  'social.add': 'Ajouter',
  // The friend request is feminine, so the participle agrees.
  'social.requestSent': 'Envoyée',
  'social.noResults': 'Personne avec ce pseudo.',
  // Echoes the feature's own name in settings.contactMatching.
  'social.matchContacts': 'Chercher dans mes contacts',

  // C-03 · person profile
  'social.profileTitle': 'Profil',
  'social.personUnavailableTitle': 'Pas disponible',
  'social.personUnavailableBody': "Cette personne n'est pas visible pour toi.",
  'social.handleLevel': '@{username} · niveau {level}',
  'social.addFriend': 'Ajouter en ami',
  'social.removeFriend': 'Retirer des amis',
  'social.block': 'Bloquer',
  'social.unblock': 'Débloquer',
  'social.report': 'Signaler',
  // No space before "?" — see the glossary.
  'social.blockConfirmTitle': 'Bloquer {name}?',
  'social.blockConfirmBody':
    "Cette personne ne pourra plus te trouver, voir tes soirées, ni apparaître nulle part dans ton app. Elle n'est pas prévenue.",
  'social.nightsTogetherLabel': 'Soirées ensemble',
  'social.mutualCrews': 'Bandes en commun',
  'social.whatYouDontSee': 'CE QUE TU NE VOIS PAS ICI',
  'social.whatYouDontSeeBody':
    "Combien cette personne boit, ses séries, ou une comparaison avec toi. ROUNDS ne classe jamais les gens sur quoi que ce soit qui se compte en alcool.",

  // C-04 · contact match
  'social.contactsTitle': 'Trouver des amis dans tes contacts',
  'social.contactsPrivacy':
    "Tes numéros sont hachés sur cet appareil avant que quoi que ce soit parte. Les numéros bruts ne quittent jamais ton téléphone, et on ne garde pas ta liste de contacts.",
  'social.contactsNone': "Personne dans tes contacts n'est encore sur ROUNDS.",

  // C-09 · crew detail
  'social.crewTitle': 'Bande',
  // "Introuvable" is invariable, so the same word works for a bande, un plan
  // and un lieu.
  'social.crewNotFoundTitle': 'Introuvable',
  'social.crewNotFoundBody': 'Aucune bande avec ce nom.',
  // Same verb as common.achPlanMakerHint — on monte un plan.
  'social.planSomething': 'Monte un plan',
  'social.plans': 'PLANS',
  'social.crewNoPlans':
    "Rien dans le calendrier. Une bande sans plan dedans, c'est juste une conversation de groupe.",
  'social.crewPlanWhen': '{day} {time}',
  'social.together': 'ENSEMBLE',
  'social.togetherNote': 'Les soirées ensemble, les lieux explorés, les quêtes faites. Jamais les verres.',
  'social.you': 'Toi',
  'social.boardPlaces': { one: '{count} lieu', other: '{count} lieux' },
  'social.boardRow': {
    one: '{count} soirée · {places}',
    other: '{count} soirées · {places}',
  },
  'social.members': 'MEMBRES',

  // C-10 · create crew
  'social.newCrewTitle': 'Nouvelle bande',
  'social.create': 'Créer',
  'social.crewCreated': '{name} créée',
  'social.crewNameLabel': 'Nom',
  // An example crew name, not a proper noun — the English placeholder is the
  // Romanian for Friday, so each language gets its own weekday.
  'social.crewNamePlaceholder': 'Vendredi',
  // The crew's little emblem, picked next to its colour. "Marque" reads as a
  // brand, so "Signe".
  'social.mark': 'SIGNE',
  'social.colour': 'COULEUR',
  // Same wording as profile.colourNumbered — it is the same swatch.
  'social.colourIndex': 'Couleur {index}',

  // C-11 · join crew
  'social.joinCrewTitle': 'Rejoindre une bande',
  'social.join': 'Rejoindre',
  'social.joinCrewUnknown': "Aucune bande avec ce code. Vérifie-le avec la personne qui te l'a envoyé.",
  'social.joinedCrew': 'Tu es dans {name}',
  'social.crewCodeLabel': 'Code ou lien de la bande',
  'social.crewCodeHint': "La personne qui gère la bande peut t'en envoyer un depuis l'écran de la bande.",

  // C-12 · friend requests
  'social.requestsTitle': 'Demandes',
  'social.requestsEmptyTitle': 'Rien en attente',
  'social.requestsEmptyBody':
    "Les demandes d'ami apparaissent ici, celles que tu reçois comme celles que tu envoies.",
  'social.incoming': 'REÇUES',
  'social.accept': 'Accepter',
  'social.decline': 'Non',
  'social.sentHeader': 'ENVOYÉES',

  // Y-02 · what friends see
  'social.previewTitle': 'Ce que voient tes amis',
  'social.previewSubtitle': "Ton profil, vu de l'autre côté.",
  'social.perPerson': 'par personne',
  'social.whatTheyCannotSee': "CE QU'ILS NE PEUVENT PAS VOIR",
  'social.bulletLine': '· {line}',
  'social.cannotSeeVolume': 'Combien tu bois, jamais',
  'social.cannotSeePace': 'Ton rythme, ton estimation, ta courbe de rythme',
  'social.cannotSeeSpend': 'Tes dépenses, tes objectifs, tes séries',
  // A bullet under "ce qu'ils ne peuvent pas voir", so it stays a plain noun
  // phrase — "aucune de tes soirées" here would double the negative.
  'social.cannotSeeNights': {
    one: "Ta soirée, sauf s'ils y étaient ou si tu l'as partagée",
    other: "Tes {count} soirées, sauf s'ils y étaient ou si tu les as partagées",
  },
  'social.cannotSeeBody': 'Tes données corporelles, ta date de naissance, ta position',
  'social.notABenchmark': "Un ami n'est pas un étalon. Il n'y a rien à comparer ici.",
  'social.leaveCrew': 'Quitter cette bande',
  'social.leaveCrewTitle': 'Quitter {name} ?',
  'social.leaveCrewBody': 'Tu ne vois plus ses plans. La bande continue sans toi, et on peut te réintégrer.',
  'social.contactsRefused': "Pas de souci — ROUNDS ne peut pas lire tes contacts sans autorisation. Tu peux toujours ajouter des gens par pseudo.",
  'social.beFindable': 'ÊTRE TROUVABLE',
  'social.beFindableBody': 'Séparé exprès. Chercher tes amis ne te rend pas trouvable par tous ceux qui ont ton numéro.',
  'social.yourNumber': 'Ton numéro',
  'social.numberHint': "Haché sur ce téléphone. Le numéro lui-même n'est jamais envoyé ni conservé.",
  'social.findableSaved': 'Enregistré. Les gens qui ont ton numéro peuvent te trouver.',
  'social.makeFindable': 'Me rendre trouvable',
  'social.numberPlaceholder': '+33 6 00 00 00 00',
} satisfies Record<string, Message>;
