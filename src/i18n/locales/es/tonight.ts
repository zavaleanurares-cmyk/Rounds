import type { Message } from '../../types';

export const tonight = {
  // T-01 · idle — one message per greeting, never a greeting glued to a name.
  // "Aún despierto" would gender the reader; "en pie" is invariable.
  'tonight.greetingStillUp': 'Todavía en pie',
  'tonight.greetingStillUpNamed': 'Todavía en pie, {name}',
  'tonight.greetingMorning': 'Buenos días',
  'tonight.greetingMorningNamed': 'Buenos días, {name}',
  'tonight.greetingAfternoon': 'Buenas tardes',
  'tonight.greetingAfternoonNamed': 'Buenas tardes, {name}',
  'tonight.greetingEvening': 'Buenas noches',
  'tonight.greetingEveningNamed': 'Buenas noches, {name}',
  'tonight.nothingLoggedYet': 'Todavía no has apuntado nada.',
  // Same wording as stats.startNight — it is the same action.
  'tonight.startNight': 'Empieza una noche',
  'tonight.firstNightTitle': 'Tu primera noche',
  'tonight.firstNightBody':
    'Empieza una noche cuando salgas. Apunta lo que bebes con un solo toque y mañana por la mañana ROUNDS te enseña dónde has estado, cuánto ha costado y qué tal ha ido.',

  // the next plan
  'tonight.nextUp': 'LO SIGUIENTE',
  'tonight.nextPlanLabel': 'Próximo plan: {title}',
  'tonight.planWhen': '{day} · {time}',
  'tonight.planWhenVenue': '{day} · {time} · {venue}',
  'tonight.planWhenVoting': '{day} · {time} · aún se vota',
  // "{going} apuntados" would gender the group; the verb does not — the same
  // choice plan.inviteWhen makes, and the two words are plan.rsvpIn and
  // plan.rsvpMaybe.
  'tonight.rsvpSummary': '{going} se apuntan · {maybe} quizá',
  'tonight.nothingPlanned': 'Nada planeado',
  'tonight.nothingPlannedBody': 'Mete algo en el calendario y tu peña puede votar dónde.',
  // Same wording as social.planSomething.
  'tonight.planSomething': 'Monta un plan',

  // the two tiles and the goal bar
  'tonight.dryStreak': 'Racha sin alcohol',
  // A caption under the big figure, so it is the bare noun.
  'tonight.dryStreakUnit': { one: 'noche', other: 'noches' },
  'tonight.thisWeek': 'Esta semana',
  'tonight.thisWeekOf': 'de {amount} {unit}',
  'tonight.weeklyGoal': 'Objetivo semanal',

  // last night
  'tonight.lastNightLabel': 'Tu última noche',
  // Same word as morning.lastNight.
  'tonight.lastNight': 'ANOCHE',
  'tonight.lastNightDate': '{weekday} {date}',
  'tonight.aNightOut': 'Una noche',
  'tonight.lastNightSummary': {
    one: '{duration} · {count} copa · {money}',
    other: '{duration} · {count} copas · {money}',
  },

  // T-02 · planned
  'tonight.plannedTitle': 'Esta noche',
  'tonight.plannedTitleNamed': 'Esta noche, {name}',
  // Same wording as plan.startTheNight.
  'tonight.startTheNight': 'Empieza la noche',
  'tonight.startsIn': 'EMPIEZA EN',
  'tonight.startsNow': 'ahora',
  'tonight.plannedWhenVenue': '{time} · {venue}',
  'tonight.plannedWhenVoting': '{time} · aún se vota',
  'tonight.where': 'DÓNDE',
  'tonight.you': 'Tú',
  'tonight.startNightNote':
    'Empezar la noche añade a todos los que han dicho que sí y pone un HUD en directo en tu pantalla de bloqueo.',

  // T-03 · live
  // The headline where a venue name would be. Same phrase as
  // discover.outRightNow.
  'tonight.out': 'De marcha',
  'tonight.elapsed': 'de marcha {duration} · has empezado a las {time}',
  'tonight.end': 'Terminar',
  'tonight.endNight': 'Terminar la noche',
  'tonight.nothingToRepeat': 'Todavía no hay nada que repetir — apunta una primero.',
  // The drink name can be any gender, so the participle never sits after it —
  // "Negroni apuntada" would agree with copa and read wrong.
  'tonight.drinkLogged': 'Apuntado: {drink}',
  'tonight.paceNothingYet': 'todavía nada apuntado',
  'tonight.paceDrinks': { one: '{count} copa', other: '{count} copas' },
  // {minutes} is a second count and it does not drive the plural — only
  // {count} does. "min" is the abbreviation formatDuration already uses.
  'tonight.paceDrinksLast': {
    one: '{count} copa · hace {minutes}min',
    other: '{count} copas · hace {minutes}min',
  },
  // The nudge. A statement of fact and an offer, never a telling-off — no
  // "cuidado", no "deberías".
  'tonight.waterTitle': 'Dos en la última hora, nada de agua',
  'tonight.waterBody': 'Un vaso de agua ahora es lo que cambia mañana.',
  'tonight.logWater': 'Apuntar agua',
  // The three quick chips are one line each — short.
  'tonight.quickWater': 'Agua',
  'tonight.quickSameAgain': 'Otra igual',
  'tonight.quickRideHome': 'A casa',
  'tonight.lateNight': 'Es tarde. Vuelve a casa a salvo está a un toque.',
  'tonight.openSafety': 'Abrir Vuelve a casa a salvo',
  'tonight.liveWith': 'EN DIRECTO CON',
  'tonight.liveWithLabel': 'En directo con',
  // Same wording as live.codeLine.
  'tonight.joinCode': 'código {code}',
  'tonight.tonight': 'ESTA NOCHE',
  // Quotes the chip above it, so it must stay spelled like
  // tonight.quickSameAgain.
  'tonight.nothingYet': 'Todavía nada. El botón +, o «Otra igual» arriba.',
  'tonight.logRowLabel': '{drink} a las {time}. Editar.',

  // T-04 · wind-down
  'tonight.howWasIt': '¿Qué tal ha ido?',
  // Same wording as common.pushActionHomeSafe — it answers the same question.
  'tonight.homeSafe': 'Ya estoy en casa',
  'tonight.seeTheNight': 'Ver la noche',
} satisfies Record<string, Message>;
