import type { Message } from '../../types';

export const social = {
  // Same word as common.tabCircle — this is the screen that tab opens.
  'social.title': 'Círculo',
  'social.notifications': 'Notificaciones',

  // night one
  'social.emptyTitle': 'Todavía no hay nadie',
  'social.emptyBody':
    'ROUNDS es mejor con la gente con la que sales de verdad. Búscalos por usuario o entre tus contactos — los números se convierten en hashes en tu teléfono y no se envían nunca.',
  'social.findPeople': 'Busca gente',
  'social.yourCode': 'TU CÓDIGO',
  'social.handle': '@{username}',
  'social.usernameFallback': 'tú',
  'social.shareIt': 'Compártelo',
  'social.shareMessage': 'Añádeme en ROUNDS: @{username}',

  // the list
  'social.friendRequests': {
    one: '{count} solicitud de amistad',
    other: '{count} solicitudes de amistad',
  },
  // "De marcha" is invariable, so it never genders the person it labels.
  'social.outRightNow': 'DE MARCHA AHORA MISMO',
  'social.outNowLabel': '{name}, de marcha ahora mismo',
  'social.outNow': 'de marcha',
  'social.crews': 'PEÑAS',
  'social.makeCrew': 'Crea una peña',
  // English keeps one wording for both forms; Spanish inflects the noun.
  'social.friendsHeader': {
    one: 'AMIGO · {count}',
    other: 'AMIGOS · {count}',
  },
  // "Juntos" would gender the pair; "en común" says the same thing and does
  // not.
  'social.nightsTogether': {
    one: '{count} noche en común',
    other: '{count} noches en común',
  },
  'social.noNightsTogether': 'todavía ninguna noche en común',
  'social.joinNight': 'Únete a una noche',

  // C-02 · find people
  // "Usuario" is the word profile.handleLabel already uses for the handle.
  'social.username': 'Usuario',
  'social.usernamePlaceholder': 'anam',
  'social.rateLimited': 'Has enviado muchas solicitudes hoy. Inténtalo mañana.',
  'social.handleCrews': '@{username} · {crews}',
  'social.add': 'Añadir',
  // The request is feminine (una solicitud), so the participle agrees.
  'social.requestSent': 'Enviada',
  'social.noResults': 'Nadie con ese usuario.',
  // Echoes the feature's own name in settings.contactMatching.
  'social.matchContacts': 'Buscar en mis contactos',

  // C-03 · person profile
  'social.profileTitle': 'Perfil',
  'social.personUnavailableTitle': 'No disponible',
  'social.personUnavailableBody': 'Esta persona no es visible para ti.',
  'social.handleLevel': '@{username} · nivel {level}',
  'social.addFriend': 'Añadir a amigos',
  'social.removeFriend': 'Quitar de amigos',
  'social.block': 'Bloquear',
  'social.unblock': 'Desbloquear',
  // "Denunciar" is the verb stats.reportTitle already uses.
  'social.report': 'Denunciar',
  'social.blockConfirmTitle': '¿Bloquear a {name}?',
  'social.blockConfirmBody':
    'No podrá encontrarte, ni ver tus noches, ni aparecer en ningún sitio de tu app. No se le avisa.',
  'social.nightsTogetherLabel': 'Noches en común',
  'social.mutualCrews': 'Peñas en común',
  'social.whatYouDontSee': 'LO QUE NO VES AQUÍ',
  'social.whatYouDontSeeBody':
    'Cuánto bebe, sus rachas o cualquier comparación contigo. ROUNDS no clasifica nunca a la gente por nada que se pueda contar del alcohol.',

  // C-04 · contact match
  'social.contactsTitle': 'Busca amigos entre tus contactos',
  'social.contactsPrivacy':
    'Tus números se convierten en hashes en este dispositivo antes de enviar nada. Los números en bruto no salen nunca de tu teléfono y no guardamos tu lista de contactos.',
  'social.contactsNone': 'Todavía no hay nadie de tus contactos en ROUNDS.',

  // C-09 · crew detail
  'social.crewTitle': 'Peña',
  // The impersonal form agrees with nothing, so the same words work for una
  // peña, un plan and un sitio.
  'social.crewNotFoundTitle': 'No se encuentra',
  'social.crewNotFoundBody': 'Ninguna peña con ese nombre.',
  // Same verb as common.achPlanMakerHint — se monta un plan.
  'social.planSomething': 'Monta un plan',
  'social.plans': 'PLANES',
  'social.crewNoPlans': 'Nada en el calendario. Una peña sin ningún plan es solo un grupo de chat.',
  'social.crewPlanWhen': '{day} {time}',
  'social.together': 'JUNTOS',
  'social.togetherNote':
    'Las noches juntos, los sitios explorados, las misiones hechas. Nunca las copas.',
  'social.you': 'Tú',
  'social.boardPlaces': { one: '{count} sitio', other: '{count} sitios' },
  'social.boardRow': {
    one: '{count} noche · {places}',
    other: '{count} noches · {places}',
  },
  'social.members': 'MIEMBROS',

  // C-10 · create crew
  'social.newCrewTitle': 'Peña nueva',
  'social.create': 'Crear',
  'social.crewCreated': '{name} creada',
  'social.crewNameLabel': 'Nombre',
  // An example crew name, not a proper noun — the English placeholder is the
  // Romanian for Friday, so each language gets its own weekday.
  'social.crewNamePlaceholder': 'Viernes',
  // The crew's little emblem, picked next to its colour. "Marca" reads as a
  // brand, so "Distintivo".
  'social.mark': 'DISTINTIVO',
  'social.colour': 'COLOR',
  // Same wording as profile.colourNumbered — it is the same swatch.
  'social.colourIndex': 'Color {index}',

  // C-11 · join crew
  'social.joinCrewTitle': 'Únete a una peña',
  'social.join': 'Unirme',
  'social.joinCrewUnknown': 'Ninguna peña con ese código. Compruébalo con quien te lo ha enviado.',
  'social.joinedCrew': 'Ya estás en {name}',
  'social.crewCodeLabel': 'Código o enlace de la peña',
  'social.crewCodeHint': 'Quien lleva la peña puede enviarte uno desde la pantalla de la peña.',

  // C-12 · friend requests
  'social.requestsTitle': 'Solicitudes',
  'social.requestsEmptyTitle': 'Nada pendiente',
  'social.requestsEmptyBody':
    'Las solicitudes de amistad aparecen aquí, tanto las que recibes como las que envías.',
  'social.incoming': 'RECIBIDAS',
  'social.accept': 'Aceptar',
  'social.decline': 'No',
  'social.sentHeader': 'ENVIADAS',

  // Y-02 · what friends see
  'social.previewTitle': 'Lo que ven tus amigos',
  'social.previewSubtitle': 'Tu perfil, desde el otro lado.',
  'social.perPerson': 'por persona',
  'social.whatTheyCannotSee': 'LO QUE NO PUEDEN VER',
  'social.bulletLine': '· {line}',
  'social.cannotSeeVolume': 'Cuánto bebes, nunca',
  'social.cannotSeePace': 'Tu ritmo, tu estimación, tu curva de ritmo',
  'social.cannotSeeSpend': 'Tu gasto, tus objetivos, tus rachas',
  // A bullet under "lo que no pueden ver", so it stays a plain noun phrase —
  // "ninguna de tus noches" here would double the negative.
  'social.cannotSeeNights': {
    one: 'Tu noche, salvo que estuvieran allí o que la hayas compartido',
    other: 'Tus {count} noches, salvo que estuvieran allí o que las hayas compartido',
  },
  'social.cannotSeeBody': 'Tus datos corporales, tu fecha de nacimiento, tu ubicación',
  'social.notABenchmark': 'Un amigo no es un baremo. Aquí no hay nada que comparar.',
  'social.leaveCrew': 'Salir de esta peña',
  'social.leaveCrewTitle': '¿Salir de {name}?',
  'social.leaveCrewBody': 'Dejas de ver sus planes. La peña sigue sin ti, y pueden volver a meterte.',
  'social.contactsRefused': 'Sin problema — ROUNDS no puede leer tus contactos sin permiso. Aún puedes añadir gente por su usuario.',
  'social.beFindable': 'QUE TE ENCUENTREN',
  'social.beFindableBody': 'Separado a propósito. Buscar a tus amigos no hace que te encuentre todo el que tenga tu número.',
  'social.yourNumber': 'Tu número',
  'social.numberHint': 'Se cifra en este teléfono. El número en sí no se envía ni se guarda nunca.',
  'social.findableSaved': 'Guardado. Quien tenga tu número puede encontrarte.',
  'social.makeFindable': 'Que me encuentren',
  'social.numberPlaceholder': '+34 600 00 00 00',

  // a friend request the server declined
  'social.requestSelf': "Ese eres tú.",
  'social.searchOffline': "No se puede buscar ahora. Comprueba tu conexión.",
} satisfies Record<string, Message>;
