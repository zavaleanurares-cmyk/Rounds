import type { Message } from '../../types';

export const common = {
  // "Esta noche" also names the tab in stats.backToTonight — the two must stay
  // spelled the same way.
  'common.tabTonight': 'Esta noche',
  'common.tabDiscover': 'Descubre',
  // The friends-and-crews tab. "Círculo" keeps the English's deliberate
  // vagueness — it is neither only amigos nor only peñas.
  'common.tabCircle': 'Círculo',
  'common.tabYou': 'Tú',

  // The pace word — shouted in caps inside the ring, so short.
  'common.paceEasy': 'TRANQUILO',
  'common.paceSteady': 'ESTABLE',
  'common.paceQuick': 'RÁPIDO',
  'common.paceSlowDown': 'MÁS DESPACIO',

  'common.unitUnits': 'unidades',
  'common.unitDrinks': 'copas',
  'common.approxUnits': '≈ {value} {unit}',

  'common.distanceMetres': '{value}m',
  'common.distanceKilometres': '{value}km',

  // The ampersand is not idiomatic in Spanish headers, so "y" — the same
  // choice the settings catalogue makes.
  'common.categoryBeer': 'Cerveza y sidra',
  'common.categoryWine': 'Vino',
  'common.categorySpirit': 'Licores',
  'common.categoryCocktail': 'Cócteles',
  'common.categoryShot': 'Chupitos',
  // The category holds soft drinks; "Sin alcohol" is what a menu says.
  'common.categorySoft': 'Sin alcohol',
  'common.categoryWater': 'Agua',

  // The IBA family headings. The cocktails themselves keep their names; these
  // three headings are ordinary words and are translated.
  'common.ibaUnforgettable': 'Los Inolvidables',
  'common.ibaContemporary': 'Clásicos contemporáneos',
  'common.ibaNewEra': 'Bebidas de la nueva era',

  'common.missingBrowser': 'No está disponible en un navegador — abre ROUNDS en un teléfono.',
  'common.missingDevBuild':
    'Necesita una build de desarrollo. Expo Go no puede cargar código nativo propio.',
  'common.missingDevice': 'No está disponible en este dispositivo.',

  'common.channelSafety': 'Avisos de seguridad',
  'common.channelMorning': 'Resumen de la mañana',
  'common.channelPlans': 'Planes',
  'common.channelSocial': 'Amigos y peñas',
  'common.channelWeekly': 'Resumen de la semana',
  'common.channelGamification': 'Logros',

  'common.pushSafetyTitle': '¿Estás en casa?',
  'common.pushSafetyBody':
    'Toca para dar el aviso. Si no lo haces, avisamos a tus contactos de confianza en 15 minutos.',
  'common.pushMorningTitle': 'Tu noche está lista',
  'common.pushMorningBody': 'Dónde has estado, cuánto ha costado y los huecos que vale la pena rellenar.',
  'common.pushActionHomeSafe': 'Ya estoy en casa',
  'common.pushActionMoreTime': 'Dame una hora',
  'common.pushExpoGoNote':
    'Expo Go no tiene push remoto en Android. Las notificaciones locales — incluido el aviso de seguridad — sí funcionan.',

  // "Iniciar sesión con Apple" is Apple's own Spanish name for the feature.
  'common.authAppleNeedsIosBuild': 'Iniciar sesión con Apple necesita una build de iOS.',
  'common.authAppleUnavailable':
    'Iniciar sesión con Apple no está disponible en este dispositivo.',
  'common.authAppleNoToken': 'Apple no ha devuelto un token de identidad.',
  'common.authGoogleNotConfigured':
    'El inicio de sesión con Google no está configurado en esta build.',
  'common.authGoogleNoToken': 'Google no ha devuelto un token de identidad.',
  'common.authDidNotGoThrough': 'No ha funcionado. No se ha cambiado nada.',

  'common.mapPinVisited': '{name}, ya has estado aquí',

  'common.installTitle': 'Pon ROUNDS en tu pantalla de inicio',
  // "Añadir a pantalla de inicio" is iOS's own Spanish wording in the share
  // sheet — quoted, not translated. Verify against the shipping iOS build
  // before release; if Apple's string changes, this must change with it.
  'common.installBodyIos':
    'Toca el botón de compartir y luego «Añadir a pantalla de inicio». Se abre a pantalla completa, guarda tus datos y funciona sin cobertura.',
  'common.installBody': 'Se abre a pantalla completa, guarda tus datos y funciona sin cobertura.',
  'common.install': 'Instalar',

  'common.demoPlanNotificationTitle': 'Ana ha añadido un plan',
  'common.demoPlanNotificationBody': 'Viernes, en condiciones · 21:30',
  'common.demoRequestNotificationTitle': 'Sara te ha enviado una solicitud de amistad',
  'common.demoRequestNotificationBody': 'Toca para aceptar o rechazar',
  'common.demoMorningNotificationTitle': 'Tu noche está lista',
  'common.demoMorningNotificationBody': 'Dos sitios, 4h10. ¿Rellenas los huecos?',

  // Achievements. Names are two or three words — they sit in a fixed row.
  'common.achFirstNightName': 'Primera noche',
  'common.achFirstNightHint': 'Apunta una noche de principio a fin.',
  // An agent noun has to pick a gender; the result does not, so every name in
  // this set is a noun phrase instead.
  'common.achGapFillerName': 'Huecos rellenos',
  'common.achGapFillerHint': 'Rellena los huecos en una pantalla de la mañana siguiente.',
  'common.achWeekOfLogsName': 'Siete seguidas',
  'common.achWeekOfLogsHint': 'Apunta siete noches.',
  'common.achMorningPersonName': 'Madrugador',
  'common.achMorningPersonHint': 'Responde cinco veces a «cómo te sientes».',
  'common.achHonestEditorName': 'Corrección honesta',
  'common.achHonestEditorHint': 'Corrige una noche después.',
  'common.achFiveVenuesName': 'Cinco sitios',
  'common.achFiveVenuesHint': 'Apunta en cinco sitios distintos.',
  'common.achTenVenuesName': 'Diez sitios',
  'common.achTenVenuesHint': 'Apunta en diez sitios distintos.',
  'common.achNewPlaceName': 'Un sitio nuevo',
  'common.achNewPlaceHint': 'Ve a un sitio donde no haya estado nadie de tu peña.',
  'common.achPassportPageName': 'Página de pasaporte',
  'common.achPassportPageHint': 'Consigue sellos en tres sitios en un mes.',
  'common.achHomeCityName': 'Del barrio',
  'common.achHomeCityHint': 'Apunta veinte veces en la misma ciudad.',
  'common.achFarAfieldName': 'Fuera de casa',
  'common.achFarAfieldHint': 'Apunta una noche en otra ciudad.',
  'common.achHydratedName': 'Hidratación',
  'common.achHydratedHint': 'Apunta agua tres noches seguidas.',
  'common.achDryWeekName': 'Semana sin alcohol',
  'common.achDryWeekHint': 'Siete noches sin apuntar nada.',
  // Elides "alcohol" from the line above it, the way Spanish does: "una semana
  // sin", "dos semanas sin".
  'common.achDryFortnightName': 'Dos semanas sin',
  'common.achDryFortnightHint': 'Catorce noches sin apuntar nada.',
  'common.achUnderGoalName': 'Bajo el objetivo',
  'common.achUnderGoalHint': 'Acaba una semana por debajo de tu límite semanal.',
  'common.achUnderGoalMonthName': 'Un mes entero',
  'common.achUnderGoalMonthHint': 'Cuatro semanas por debajo de tu límite semanal.',
  // "En casa antes de las dos" does not fit the row; the hint below carries
  // the exact hour.
  'common.achEarlyHomeName': 'Antes de las 2',
  'common.achEarlyHomeHint': 'Acaba tres noches antes de las 02:00.',
  'common.achWaterFirstName': 'Primero agua',
  'common.achWaterFirstHint': 'Empieza una noche con agua.',
  'common.achSafeArrivalName': 'Aviso dado',
  'common.achSafeArrivalHint': 'Arma un aviso de llegada y confírmalo.',
  // "No solo" picks a gender. "En compañía" says the same thing and does not.
  'common.achFirstFriendName': 'En compañía',
  'common.achFirstFriendHint': 'Añade a tu primer amigo.',
  'common.achCrewFounderName': 'Peña fundada',
  'common.achCrewFounderHint': 'Crea una peña.',
  'common.achPlanMakerName': 'Plan montado',
  'common.achPlanMakerHint': 'Monta un plan al que digan que sí tres personas.',
  'common.achRoundBuyerName': 'Tu ronda',
  'common.achRoundBuyerHint': 'Paga una ronda para tres personas.',
  'common.achLookedOutName': 'Contacto de confianza',
  'common.achLookedOutHint': 'Sé el contacto de confianza de alguien.',

  // The pace ring, spoken. Sentence case, unlike the shouted forms above.
  'common.paceSpokenEasy': 'Tranquilo',
  'common.paceSpokenSteady': 'Estable',
  'common.paceSpokenQuick': 'Rápido',
  'common.paceSpokenSlowDown': 'Más despacio',
  'common.paceLabel': {
    one: 'Ritmo: {word}. {count} copa apuntada.',
    other: 'Ritmo: {word}. {count} copas apuntadas.',
  },
  'common.paceSince': {
    one: 'La última hace {count} minuto.',
    other: 'La última hace {count} minutos.',
  },
  'common.demoPlanTitle': 'Viernes, en condiciones',
  'common.demoPlanNote': 'Empezamos en Roots y el resto lo decidimos allí.',
  'common.you': 'Tú',
} satisfies Record<string, Message>;
