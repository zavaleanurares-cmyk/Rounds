import type { Message } from '../../types';

export const stats = {
  'stats.title': 'Tú',
  'stats.editProfile': 'Edita tu perfil',
  'stats.editProfileHint': 'Nombre, usuario, foto, color y la frase sobre ti',
  'stats.you': 'Tú',
  'stats.usernameFallback': 'tú',
  'stats.handle': '@{username}',
  'stats.handleCity': '@{username} · {city}',

  // night one
  'stats.emptyTitle': 'Todavía no hay nada que mostrar',
  'stats.emptyBody':
    'Después de tu primera noche esto se llena con lo que has gastado, dónde has ido y cómo se comparan las semanas. Nada de esto se comparte con nadie.',
  'stats.startNight': 'Empieza una noche',

  // spend
  'stats.spentThisYear': 'GASTADO ESTE AÑO',
  'stats.trendUp': '+{pct}% vs el mes pasado',
  'stats.trendDown': '{pct}% vs el mes pasado',
  'stats.perNight': '{amount} por noche de media',

  // quick actions
  // "Insights" has no informal Spanish noun; "Tendencias" is what the screen
  // actually shows, and it fits the same four-label row as the other three.
  'stats.insights': 'Tendencias',
  'stats.goals': 'Objetivos',
  // "Wrapped" is a Spotify borrowing rather than a word; "Tu año" says what the
  // screen is, and the eyebrow above it still reads ROUNDS {year}.
  'stats.wrapped': 'Tu año',
  'stats.passport': 'Pasaporte',

  // heatmap and nights
  'stats.lastNights': {
    one: 'ÚLTIMA NOCHE',
    other: 'ÚLTIMAS {count} NOCHES',
  },
  'stats.recentNights': 'NOCHES RECIENTES',
  'stats.aNightOut': 'Una noche',
  'stats.nightRow': {
    one: '{date} · {duration} · {count} copa',
    other: '{date} · {duration} · {count} copas',
  },
  'stats.allNights': 'Todas las noches',
  'stats.achievements': 'Logros',

  // ── shared across the screens below ──
  'stats.somewhere': 'En algún sitio',
  'stats.on': 'Activado',
  'stats.off': 'Desactivado',
  'stats.days': 'días',
  'stats.percent': '{pct}%',

  // Y-05 · Insights
  'stats.insightsAllTime': 'Desde el principio',
  'stats.insightsLast90': 'Últimos 90 días',
  'stats.insightsEmptyTitle': 'Aún no hay suficientes noches',
  'stats.insightsEmptyBody':
    'A partir de tres o cuatro noches, los patrones empiezan a ser reales y no ruido. Vuelve entonces.',
  'stats.last30Days': 'Últimos 30 días',
  'stats.vsPrevious30': 'vs los 30 anteriores',
  'stats.deltaUp': '+{pct}%',
  'stats.deltaDown': '{pct}%',
  'stats.eightWeeks': 'OCHO SEMANAS',
  'stats.weeksNotEnough': 'Aún no hay semanas suficientes para hablar de tendencia.',
  'stats.weeksFirst': 'Tus primeras semanas de datos.',
  'stats.weeksSteady': 'Estable — las últimas tres semanas se parecen a las anteriores.',
  'stats.weeksHeavier':
    'Las últimas tres semanas son alrededor de un {pct}% más cargadas que las anteriores.',
  'stats.weeksLighter':
    'Las últimas tres semanas son alrededor de un {pct}% más ligeras que las anteriores.',
  'stats.spendHeader': 'GASTO',
  'stats.spendThisMonth': '{amount} este mes',
  'stats.spendPerNight': '{amount} por noche de media.',
  'stats.spendTooEarly': 'Es pronto para decirlo — el mes pasado fueron {amount}.',
  'stats.spendProjected': 'A este ritmo, son {amount} en un año.',
  'stats.byDay': 'POR DÍA',

  'stats.dayShortSun': 'dom',
  'stats.dayShortMon': 'lun',
  'stats.dayShortTue': 'mar',
  'stats.dayShortWed': 'mié',
  'stats.dayShortThu': 'jue',
  'stats.dayShortFri': 'vie',
  'stats.dayShortSat': 'sáb',
  'stats.dayInitialSun': 'D',
  'stats.dayInitialMon': 'L',
  // X for miércoles is the Spanish convention — M is already martes.
  'stats.dayInitialTue': 'M',
  'stats.dayInitialWed': 'X',
  'stats.dayInitialThu': 'J',
  'stats.dayInitialFri': 'V',
  'stats.dayInitialSat': 'S',

  'stats.biggestNight': '{day} es constantemente tu noche más grande.',
  'stats.predictedVsActual': 'PREVISTO VS REAL',
  'stats.bandFine': 'bien',
  'stats.bandTender': 'tocado',
  'stats.bandRough': 'fatal',
  'stats.morningTuneNote':
    'Responder a «cómo te sientes» cada mañana es lo que ajusta esto a ti y no a las medias.',

  // Y-06 · Wellbeing
  'stats.wellbeing': 'Bienestar',
  'stats.goalNightlyCap': 'Límite por noche',
  'stats.goalWeeklyCap': 'Límite semanal',
  'stats.goalDryDays': 'Días sin alcohol al mes',
  'stats.goalSpendCap': 'Límite de gasto',
  'stats.goalNicotineFree': 'Días sin nicotina',
  'stats.goalFallback': 'Objetivo',
  'stats.dryStreakHeader': 'RACHA SIN ALCOHOL',
  // The number is the big figure above this line, so the line itself starts on
  // the noun and never repeats {count}.
  'stats.dryStreakLongest': {
    one: 'noche · la más larga {longest}',
    other: 'noches · la más larga {longest}',
  },
  'stats.noOutStreakNote':
    'Aquí no hay racha de noches seguidas fuera. Esa premiaría lo que no toca.',
  'stats.goalOf': '{value} de {target}',
  'stats.goalOfUnit': '{value} de {target} {unit}',
  'stats.goalsHeader': 'OBJETIVOS',
  'stats.getHomeSafe': 'Vuelve a casa a salvo',
  'stats.stopsBeingFun': 'Si deja de ser divertido',
  'stats.stopsBeingFunBody':
    'Hablar con alguien sobre la bebida es algo normal, y no hace falta que antes haya una crisis.',
  'stats.alcoholSupport': 'Ayuda con el alcohol · recursos de la OMS',
  'stats.findLocalServices': 'Busca servicios cerca de ti',

  // Y-07 · Goal editor
  'stats.less': 'Menos',
  'stats.more': 'Más',
  'stats.perWeek': 'a la semana',
  'stats.trackThisGoal': 'Sigue este objetivo',
  'stats.goalsPrivate':
    'Tus objetivos son tuyos. Nada de esto se comparte, se clasifica ni se le enseña a nadie.',

  // Y-03 · Nights
  'stats.nightsTitle': 'Noches',
  // "registradas" needs something to agree with, so the noun comes back in —
  // the bare "{count} recorded" of the English has no gender.
  'stats.nightsRecorded': {
    one: '{count} noche registrada',
    other: '{count} noches registradas',
  },
  'stats.nightsEmptyTitle': 'Todavía no hay noches',
  'stats.nightsEmptyBody':
    'Cada noche que registras aparece aquí — dónde has ido, con quién y cuánto ha costado.',
  'stats.view': 'Vista',
  'stats.viewList': 'Lista',
  'stats.viewCalendar': 'Calendario',
  'stats.nightRowFull': {
    one: '{date} · {duration} · {count} copa · {money}',
    other: '{date} · {duration} · {count} copas · {money}',
  },
  'stats.last12Weeks': 'ÚLTIMAS 12 SEMANAS',
  'stats.heatmapNote': 'Los cuadrados vacíos son noches sin alcohol. Toca uno lleno para abrirlo.',

  // Y-09 · Achievements
  'stats.achievementsCount': '{earned} de {total}',
  'stats.levelsNote':
    'Los niveles salen de registrar noches, de responder a la pregunta de la mañana, de las noches que te quedas en casa y de los sitios nuevos. Ni un solo punto sale de cuánto has bebido.',
  'stats.groupExploration': 'EXPLORACIÓN',
  'stats.groupConsistency': 'CONSTANCIA',
  'stats.groupModeration': 'MODERACIÓN',
  'stats.groupTogether': 'JUNTOS',
  'stats.xp': '+{xp}',
  'stats.noVolumeNote': 'Aquí nada premia beber más. Es a propósito.',

  // Y-11 · Passport
  'stats.passportEmptyTitle': 'Todavía no hay sellos',
  'stats.passportEmptyBody':
    'Cada sitio donde apuntas algo te da un sello por noche. Se llena más rápido de lo que crees.',
  'stats.findSomewhere': 'Busca un sitio',
  'stats.places': { one: '{count} sitio', other: '{count} sitios' },
  'stats.stampsCount': { one: '{count} sello', other: '{count} sellos' },
  'stats.passportSubtitle': '{places} · {stamps}',
  'stats.stampLabel': {
    one: '{venue}, {count} sello',
    other: '{venue}, {count} sellos',
  },
  'stats.stampTimes': '×{count}',
  'stats.passportNote': 'Un sello por sitio y por noche. Exploración, no cantidad.',

  // Y-12 · Wrapped
  'stats.wrappedEyebrow': 'ROUNDS {year}',
  'stats.wrappedNights': { one: '{count} noche', other: '{count} noches' },
  'stats.wrappedNightsBody': {
    one: 'Saliste {count} vez en {year}.',
    other: 'Saliste {count} veces en {year}.',
  },
  'stats.wrappedTopVenue': 'En {venue} has estado más que en ningún otro sitio.',
  'stats.wrappedVaried': 'Has ido variando.',
  'stats.wrappedSpendBody': 'Lo que ha costado el año, en todas las rondas que has apuntado.',
  'stats.wrappedQuietNights': {
    one: '{count} noche tranquila',
    other: '{count} noches tranquilas',
  },
  'stats.wrappedQuietBody': 'Las noches en las que no saliste también cuentan.',
  'stats.wrappedDrinks': { one: '{count} copa', other: '{count} copas' },
  'stats.wrappedDrinksBody': 'Sin más, sin gráfico y sin compararte con nadie.',
  // An accessibility label on the tap target, so "pantalla" rather than the
  // English-only "slide".
  'stats.nextSlide': 'Siguiente pantalla',
  'stats.tapToContinue': 'Toca para continuar',

  // Y-08 · Nicotine
  'stats.nicotine': 'Nicotina',
  'stats.nicotineOffTitle': 'Este módulo está desactivado',
  'stats.nicotineOffBody':
    'El seguimiento de la nicotina es opcional y está desactivado por defecto. Actívalo y aquí verás el consumo, el gasto y las rachas de días sin.',
  'stats.turnItOn': 'Actívalo',
  'stats.thisWeek': 'Esta semana',
  'stats.logged': 'apuntados',
  'stats.freeStreak': 'Racha sin nicotina',
  'stats.nicotineNote':
    "Se registra aquí, no en la hoja de bebidas, y queda fuera de tu historial — nicotina y alcohol nunca se mezclan en una sola cifra.",
  // S-15 · Report
  'stats.reportTitle': 'Denunciar',
  'stats.reportedTitle': 'Denunciado',
  'stats.reportThankYou': 'Gracias',
  'stats.reportThankYouBody':
    'Una persona revisa cada denuncia, normalmente en 24 horas. No tendrás respuesta salvo que necesitemos algo de ti, y a la otra persona nunca se le dice quién la ha denunciado.',
  'stats.reportAlsoBlock': 'Bloquear también a {name}',
  'stats.sendReport': 'Enviar denuncia',
  'stats.whatHappened': 'QUÉ HA PASADO',
  'stats.reportDetail': 'Algo más que añadir (opcional)',
  'stats.reasonHarassment': 'Acoso o intimidación',
  'stats.reasonSpam': 'Spam',
  'stats.reasonImpersonation': 'Suplantación de identidad',
  'stats.reasonInappropriate': 'Contenido inapropiado',
  'stats.reasonSafety': 'Me preocupa la seguridad de alguien',
  'stats.reasonOther': 'Otra cosa',

  // C-08 · Share card
  'stats.shareEmptyTitle': 'Nada que compartir',
  'stats.shareEmptyBody': 'Esa noche no está en este dispositivo.',
  'stats.shareTitle': 'Comparte esta noche',
  'stats.shareMessage': {
    one: '{venue} · {duration} · {count} sitio — ROUNDS',
    other: '{venue} · {duration} · {count} sitios — ROUNDS',
  },
  'stats.shareDate': '{weekday} {date}',
  'stats.outCaption': 'fuera',
  'stats.placeUnit': { one: 'sitio', other: 'sitios' },
  'stats.shareNote':
    'Tu ritmo, tu estimación y lo que has bebido nunca salen en una tarjeta compartida. Solo sitios, horas y gente.',

  // the drink sheet
  'stats.everyDrink': 'Cada copa',
  'stats.everyDrinkSubtitle': {
    one: '{count} copa dibujada, ni un solo emoji',
    other: '{count} copas dibujadas, ni un solo emoji',
  },
  'stats.size': 'Tamaño',
  // "Chip" has no usable Spanish loan here, so the component is named for what
  // it looks like on screen.
  'stats.sizeChips': 'Como en las etiquetas',
  'stats.sizeLarge': 'Grande',
  'stats.familyEveryday': 'Habituales',
  'stats.drinkGroupHeader': '{label} · {count}',
  'stats.drinkSpec': '{name}, {volume} mililitros al {abv} por ciento',

  // A-13 · Legal viewer chrome
  // [DRAFT] is the literal marker the legal documents are scanned for, so it
  // stays in English.
  'stats.legalDraftNotice':
    'Las secciones marcadas con [DRAFT] son provisionales, a la espera del abogado, y hay que cerrarlas antes de enviar.',
  'stats.legalUpdated': 'Última actualización {date}',

  // +not-found
  'stats.notFoundTitle': 'Aquí no hay nada',
  'stats.notFoundEmptyTitle': 'Ese enlace no lleva a ningún sitio',
  'stats.notFoundBody':
    'La página que buscabas no existe — o la noche a la que apuntaba ya ha terminado.',
  // "Esta noche" names the tab, so it keeps its capital.
  'stats.backToTonight': 'Volver a Esta noche',
  'stats.nicotineLogged': "{what} registrado",
  'stats.nicotineTonight': "ESTA NOCHE",
  'stats.pouchMgHeader': "NICOTINA EN BOLSITAS ESTA SEMANA",
  'stats.pouchMgValue': "{mg} mg",
  'stats.pouchMgNote': "De las bolsitas, que vienen etiquetadas. Los cigarrillos se cuentan, no se pesan — ver abajo.",
  'stats.pouches': "Bolsitas",
  'stats.smoked': "Fumado",
  'stats.mg': "{mg} mg",
  'stats.pouchLabel': "{name}, {mg} miligramos",
  'stats.pouchCapNote': "Intensidades tal como se venden. La ley rumana limita una bolsita a {max} mg, así que no aparece nada más fuerte.",
  'stats.noYieldNote': "Aquí no hay miligramos, a propósito. Las normas de la UE quitaron las cifras de nicotina de las cajetillas porque hacían que unas marcas parecieran menos dañinas. Contar es la medida honesta.",
} satisfies Record<string, Message>;
