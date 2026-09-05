import type { Message } from '../../types';

export const settings = {
  // S-01 · Settings home
  'settings.groupYou': 'TÚ',
  'settings.groupApp': 'APP',
  // The ampersand is not idiomatic in Spanish headers, so "y" throughout —
  // the rhythm of the pair is what the English is doing, not the symbol.
  'settings.groupSafetyPeople': 'SEGURIDAD Y GENTE',
  'settings.groupDeveloper': 'DESARROLLADOR',
  'settings.unitsRegion': 'Unidades y región',
  'settings.appearance': 'Apariencia',
  'settings.modules': 'Módulos',
  'settings.modulesNicotineOn': 'Nicotina activada',
  'settings.modulesDefault': 'Por defecto',
  'settings.notifications': 'Notificaciones',
  'settings.privacy': 'Privacidad',
  'settings.safety': 'Seguridad',
  'settings.safetyContacts': { one: '{count} contacto', other: '{count} contactos' },
  'settings.safetyNotSetUp': 'Sin configurar',
  'settings.systemSurfaces': 'Superficies del sistema',
  'settings.systemSurfacesSubtitle': 'Live Activity, widgets, Siri, reloj',
  'settings.blockedUsers': 'Usuarios bloqueados',
  'settings.dataAccount': 'Datos y cuenta',
  'settings.helpLegal': 'Ayuda y aspectos legales',
  'settings.demoData': 'Datos de demo',
  'settings.demoDataSubtitle': 'Llena la app con 14 semanas de historial verosímil',
  'settings.everyDrink': 'Cada copa',
  // "Todos los 1 glifo" does not work, so the singular drops {count}.
  'settings.everyDrinkSubtitle': {
    one: 'Un glifo, dibujado',
    other: 'Todos los {count} glifos, dibujados',
  },
  'settings.signOut': 'Cerrar sesión',
  'settings.versionLine': 'ROUNDS {version} · @{username}',
  'settings.usernameFallback': 'tú',
  'settings.handle': '@{username}',

  // S-02 · Appearance, motion and sound
  // "Acento" as a design word is jargon in Spanish; "color" is what anyone
  // would say in front of a colour picker.
  'settings.nightAccent': 'COLOR DE LA NOCHE',
  'settings.accentLabel': 'Color {index}',
  'settings.accentNote':
    'Cada noche tiene su propio color, así tu historial tiene color. Aquí eliges por cuál empieza ROUNDS.',
  'settings.dimAfter1am': 'Atenuar a partir de la 1',
  'settings.dimAfter1amSubtitle': 'Baja la aurora y sube el contraste de madrugada',
  'settings.reduceMotion': 'Reducir movimiento',
  'settings.reduceMotionSubtitle': 'También sigue el ajuste de tu sistema',
  // Device feedback — vibration and sound — not user feedback about the app.
  'settings.groupFeedback': 'RESPUESTA',
  'settings.haptics': 'Vibración',
  'settings.hapticsSubtitle': 'Un toque pequeño cuando algo se registra',
  'settings.sound': 'Sonido',
  'settings.soundSubtitle':
    'Desactivado por defecto. Nunca suena si tienes el teléfono en silencio.',
  'settings.hearThem': 'ESCÚCHALOS',
  'settings.cueLog': 'Una copa',
  'settings.cueRound': 'Una ronda',
  'settings.cueStart': 'Empieza la noche',
  'settings.cueEnd': 'Acaba la noche',
  'settings.cueLevelUp': 'Subes de nivel',
  'settings.playCue': 'Reproducir {label}',

  // S-03 · Units & region
  'settings.standardDrinkHeader': 'COPA ESTÁNDAR',
  'settings.unitSystemLabel': 'Sistema de unidades',
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'settings.unitSystemEU': 'EU',
  'settings.unitSystemUK': 'UK',
  'settings.unitSystemUS': 'US',
  'settings.standardDrinkNote':
    'Una unidad = {grams} g de alcohol. Tu historial se guarda en gramos, así que esto solo cambia cómo se muestran los números — nunca lo que significan.',
  'settings.currencyHeader': 'MONEDA',
  'settings.currencyLabel': 'Moneda',
  'settings.paceReadoutHeader': 'LA LECTURA DEL RITMO',
  'settings.showEstimate': 'Mostrar la estimación en ‰',
  'settings.showEstimateSubtitle':
    'Desactivado por defecto. La palabra del ritmo es la lectura de verdad — te compara con tu viernes de siempre, y eso el número no puede hacerlo.',
  'settings.estimateNote':
    'Se muestre o no, la cifra es una estimación a partir de medias de población, se calcula en tu teléfono y no se envía a ninguna parte, y desaparece del todo cuando ROUNDS te está diciendo que vayas más despacio. No la uses nunca para decidir si conduces.',

  // S-04 · Modules
  'settings.nicotineTracking': 'Seguimiento de nicotina',
  'settings.nicotineTrackingSubtitle':
    'Añade un panel aparte. Nunca se mezcla con tu historial de copas.',
  'settings.socialFeatures': 'Funciones sociales',
  'settings.socialFeaturesSubtitle': 'Amigos, peñas, noches compartidas, planes',
  'settings.socialOffNote':
    'Con lo social desactivado, ROUNDS es totalmente privado: el ritmo, el gasto, el historial, los objetivos y todo lo de Vuelve a casa a salvo siguen funcionando.',

  // S-05 · Notifications
  'settings.notificationsSubtitle':
    'Como mucho tres por semana por defecto. Nunca durante una noche en directo.',
  'settings.morningRecap': 'Resumen de la mañana',
  // "aviso" is reserved for a safety check-in, so a push is "notificación".
  'settings.morningRecapSubtitle': 'Una notificación a tu hora habitual de despertarte',
  'settings.weeklyRecap': 'Resumen de la semana',
  'settings.plans': 'Planes',
  'settings.plansSubtitle': 'Invitaciones y recordatorios',
  'settings.social': 'Social',
  'settings.socialSubtitle': 'Solicitudes de amistad y actividad de las peñas',
  'settings.safetyNotificationsSubtitle': 'Recordatorios de aviso y escalada',
  'settings.safetyArmedNote': 'No se puede desactivar mientras haya un aviso armado.',
  'settings.achievements': 'Logros',
  'settings.achievementsSubtitle': 'Desactivado por defecto',
  'settings.notificationsLiveNote':
    'ROUNDS no envía nunca una notificación mientras una noche está en directo. Interrumpir a alguien que ha salido es la forma más rápida de que te borren la app.',

  // S-06 · Privacy
  'settings.privateAccount': 'Cuenta privada',
  'settings.privateAccountSubtitle': 'Solo te encuentra la gente que has aceptado',
  'settings.contactMatching': 'Búsqueda por contactos',
  // "hashes", not "cifra" — hashing is not encryption and the claim matters.
  'settings.contactMatchingSubtitle':
    'Los números se convierten en hashes en este dispositivo. Los números en bruto no salen nunca de tu teléfono.',
  'settings.shareLocationDefault': 'Compartir ubicación por defecto',
  'settings.shareLocationDefaultSubtitle':
    "Empieza a compartir durante dos horas al iniciar una noche. Puedes parar cuando quieras.",
  'settings.defaultVisibilityHeader': 'VISIBILIDAD POR DEFECTO DE LA NOCHE',
  'settings.defaultVisibilityLabel': 'Visibilidad por defecto',
  'settings.visibilityPrivate': 'Privada',
  'settings.visibilityFriends': 'Amigos',
  'settings.visibilityCrew': 'La peña',
  'settings.privacyNote':
    'Tu estimación de ritmo se calcula en este teléfono y no se guarda ni se envía nunca a ninguna parte. La ubicación se comparte noche a noche, solo con los participantes, y caduca cuando acaba la noche.',

  // S-07 · Safety settings
  'settings.trustedContacts': 'Contactos de confianza',
  'settings.contactsOfMax': { one: '{count} de {max}', other: '{count} de {max}' },
  'settings.armCheckIn': 'Armar un aviso',
  'settings.getHomeSafe': 'Vuelve a casa a salvo',
  'settings.homeAddressHeader': 'DIRECCIÓN DE CASA',
  'settings.homeAddressNote':
    'Se guarda solo en este dispositivo. Sirve para rellenar tu vuelta a casa.',
  'settings.homeAddressPlaceholder': 'Calle, ciudad',
  'settings.safetyFreeNote':
    'Todo lo de Vuelve a casa a salvo es gratis para siempre. ROUNDS no pondrá nunca una suscripción por delante.',

  // S-11 · Blocked users
  'settings.blockedTitle': 'Bloqueados',
  'settings.blockedEmptyTitle': 'Nadie bloqueado',
  'settings.blockedEmptyBody':
    'Bloquear a alguien desde su perfil lo saca de la búsqueda, de tus amigos, de todas las peñas, de todas las noches en directo y de todos los planes — al momento, y en los dos sentidos.',
  'settings.unblock': 'Desbloquear',

  // S-12 · Data & account
  'settings.exportHeader': 'EXPORTAR',
  'settings.exportBody':
    'Todo lo que ROUNDS tiene sobre ti. El JSON conserva todos los campos; el CSV es una fila por copa, listo para una hoja de cálculo. Los dos gratis, siempre.',
  'settings.exportMyData': 'Exportar mis datos',
  'settings.exportAsCsv': 'Exportar como CSV',
  'settings.exportDataCopied': 'Tus datos están en el portapapeles',
  'settings.exportCsvCopied': 'Tu CSV está en el portapapeles',
  'settings.deleteAccountHeader': 'BORRAR LA CUENTA',
  'settings.deleteAccountBody':
    'Se cierra tu sesión al momento. Todo se elimina con un borrado en cascada en el servidor después de 30 días de margen — vuelve a entrar antes de 30 días y no se habrá perdido nada.',
  'settings.deleteMyAccount': 'Borrar mi cuenta',
  // DELETE is the literal word the field is checked against — never translated.
  'settings.typeDeleteToConfirm': 'Escribe DELETE para confirmar',
  'settings.deleteEverything': 'Borrarlo todo',
  'settings.neverMind': 'Déjalo',
  'settings.pendingSync': {
    one: '{count} copa sigue pendiente de sincronizar. Se incluirá.',
    other: '{count} copas siguen pendientes de sincronizar. Se incluirán.',
  },
  'settings.allSynced': 'Todo lo de este dispositivo está sincronizado.',

  // S-13 · Help & legal
  'settings.groupLegal': 'LEGAL',
  'settings.termsOfService': 'Términos del servicio',
  'settings.privacyPolicy': 'Política de privacidad',
  'settings.groupSupport': 'SOPORTE',
  'settings.contactSupport': 'Contactar con soporte',
  'settings.reportProblem': 'Informar de un problema',
  'settings.groupDrinkingSupport': 'AYUDA CON EL ALCOHOL',
  'settings.helplines': 'Teléfonos de ayuda de tu zona',
  'settings.helplinesSubtitle': 'Gratuitos y confidenciales',
  // WHO is an organisation with a Spanish name and acronym, unlike ROUNDS.
  'settings.whoAlcoholHealth': 'OMS · alcohol y salud',
  'settings.paceDisclaimer':
    'La estimación de ritmo de ROUNDS no es un alcoholímetro ni un consejo médico. No puede tener en cuenta la comida, la medicación, una enfermedad ni una copa que se te olvidó apuntar. No la uses nunca para decidir si conduces.',

  // Demo data (developer utility)
  'settings.demoNights': { one: '{count} noche', other: '{count} noches' },
  'settings.demoCurrent': {
    one: 'Ahora mismo {count} copa en {nights}.',
    other: 'Ahora mismo {count} copas en {nights}.',
  },
  'settings.fillHistory': 'Llenar con 14 semanas de historial',
  'settings.historyAdded': 'Historial añadido',
  'settings.backToNightOne': 'Volver a la primera noche',
  'settings.cleared': 'Borrado',
  'settings.nightOneNote':
    'La primera noche es lo que ve alguien nuevo. Cada pantalla de datos tiene un estado diseñado para eso.',

  // System surfaces · the diagnostics screen
  'settings.surfacesSubtitle': 'Apuntar sin abrir la app.',
  'settings.loggedOutsideHeader': 'APUNTADO FUERA DE LA APP',
  'settings.percent': '{value}%',
  // {outside} is a bare count; the plural rides on {count}, the total.
  'settings.outsideShare': {
    one: '{outside} de {count} copa apuntada. El objetivo es el 40% — por debajo, las superficies de la pantalla de bloqueo no están cumpliendo y la app pide esfuerzo justo en el momento en que la gente tiene menos.',
    other:
      '{outside} de {count} copas apuntadas. El objetivo es el 40% — por debajo, las superficies de la pantalla de bloqueo no están cumpliendo y la app pide esfuerzo justo en el momento en que la gente tiene menos.',
  },
  'settings.devBuildNote':
    'Esto necesita una build de desarrollo. Live Activities, WidgetKit, App Intents, los controles del Centro de control, los servicios en primer plano y las teselas de Ajustes rápidos no pueden funcionar en Expo Go ni en un navegador — el plugin de configuración de `modules/rounds-native` añade los targets en `expo prebuild`.',

  'settings.buildCanDoHeader': 'LO QUE PUEDE HACER ESTA BUILD',
  'settings.capMap': 'Mapa',
  'settings.capMapReal': 'mapa real',
  'settings.capMapProjected': 'pines proyectados',
  'settings.capScanner': 'Escáner QR',
  'settings.capScannerCamera': 'cámara',
  'settings.capScannerCodeOnly': 'solo introducir el código',
  'settings.capLocation': 'Ubicación',
  'settings.capAvailable': 'disponible',
  'settings.capUnavailable': 'no disponible',
  'settings.capNotificationsLocal': 'locales · {status}',
  'settings.capRemotePush': 'Push remoto',
  'settings.capPurchases': 'Compras',
  'settings.capPurchasesConnected': 'tienda conectada',
  'settings.capBackend': 'Backend',
  'settings.capBackendOnDevice': 'solo en el dispositivo',
  'settings.turnOnNotifications': 'Activar las notificaciones',

  'settings.onThisPlatformHeader': 'EN ESTA PLATAFORMA',
  'settings.platformHud': 'HUD',
  'settings.platformWidgets': 'Widgets',
  'settings.platformQuickToggle': 'Interruptor rápido',
  'settings.platformVoice': 'Voz',
  'settings.platformNativeModule': 'Módulo nativo',
  'settings.platformAttached': 'conectado',
  'settings.platformNotInBuild': 'no está en esta build',

  // Platform API names — Live Activity, Dynamic Island, WidgetKit, App Intent,
  // App Actions, AppWidget — are left alone; the prose around them is not.
  'settings.theEightHeader': 'LAS OCHO',
  'settings.surfaceRow': '{id} · {name}',
  'settings.surfaceHudName': 'HUD de la noche en directo',
  'settings.surfaceHudIos': 'Live Activity + Dynamic Island',
  'settings.surfaceHudAndroid': 'Notificación persistente',
  'settings.surfaceQuickLogName': 'Apuntar con un toque',
  'settings.surfaceQuickLogIos': 'Botón de App Intent',
  'settings.surfaceQuickLogAndroid': 'Acción de notificación',
  'settings.surfaceWidgetSmallName': 'Widget · pequeño',
  'settings.surfaceWidgetSmallIos': 'WidgetKit',
  'settings.surfaceWidgetSmallAndroid': 'AppWidget 2×2',
  'settings.surfaceWidgetMediumName': 'Widget · mediano',
  'settings.surfaceWidgetMediumIos': 'WidgetKit, interactivo',
  'settings.surfaceWidgetMediumAndroid': 'AppWidget 4×2',
  'settings.surfaceWidgetLargeName': 'Widget · grande',
  'settings.surfaceWidgetLargeIos': 'Mapa de calor del año',
  'settings.surfaceWidgetLargeAndroid': 'AppWidget 4×4',
  'settings.surfaceTileName': 'Interruptor rápido',
  'settings.surfaceTileIos': 'Control del Centro de control',
  'settings.surfaceTileAndroid': 'Tesela de Ajustes rápidos',
  'settings.surfaceVoiceName': 'Voz',
  'settings.surfaceVoiceIos': 'App Intents / Siri',
  'settings.surfaceVoiceAndroid': 'App Actions',
  'settings.surfaceWatchName': 'Reloj',
  'settings.surfaceWatchIos': 'App de watchOS',
  'settings.surfaceWatchAndroid': 'Tesela de Wear OS',

  'settings.theRuleHeader': 'LA REGLA',
  'settings.theRuleBody':
    'Todas ellas escriben por la misma cola sin conexión que la hoja de apuntar, con un UUID que la propia superficie genera. Nunca hay una segunda vía de escritura — por eso un reloj que sincroniza una hora tarde no puede convertir una copa en dos.',
  'settings.sharedContainerPending': {
    one: '{count} copa esperando en el contenedor compartido.',
    other: '{count} copas esperando en el contenedor compartido.',
  },

  'settings.diagnosticsHeader': 'DIAGNÓSTICO',
  'settings.diagBuild': 'Build',
  'settings.diagBuildDevelopment': 'desarrollo',
  'settings.diagBuildWeb': 'web',
  'settings.diagEntitlement': 'Derecho de acceso (servidor)',
  'settings.diagEntitlementPaid': 'de pago',
  'settings.diagEntitlementFree': 'gratis',
  'settings.sendDiagnostics': 'Enviar diagnóstico',
  'settings.sendDiagnosticsSubtitle':
    'Solo recuentos y categorías — nunca una copa, un sitio ni una persona',
  'settings.language': 'Idioma',
  'settings.languageGroup': 'IDIOMA',
  'settings.languageFollowPhone': 'Seguir mi teléfono',
  'settings.languageCurrently': 'Ahora {name}',
  'settings.languageNote':
    'Esto cambia solo ROUNDS. Es inmediato — no hay nada que descargar ni que reiniciar.',
} satisfies Record<string, Message>;
