import type { Message } from '../../types';

export const ui = {
  'ui.loading': 'Se încarcă',
  'ui.back': 'Înapoi',
  'ui.dismiss': 'Închide',
  'ui.close': 'Închide',
  'ui.done': 'Gata',
  'ui.cancel': 'Anulează',
  'ui.save': 'Salvează',
  'ui.saving': 'Se salvează…',
  'ui.undo': 'Anulează',
  'ui.retry': 'Încearcă din nou',
  'ui.errorTitle': 'Nu s-a încărcat',
  'ui.errorBody': 'Nu am putut ajunge la ROUNDS acum. Ce ai notat e în siguranță pe telefonul ăsta.',
  'ui.offline': 'Offline',
  'ui.offlineWaiting': 'Offline · {count} în așteptare',
  'ui.offlineLabel': 'Offline',
  'ui.offlineLabelPending': {
    one: 'Offline, {count} băutură așteaptă sincronizarea',
    // 0 and 2–19
    few: 'Offline, {count} băuturi așteaptă sincronizarea',
    // 20 and up — takes "de"
    other: 'Offline, {count} de băuturi așteaptă sincronizarea',
  },
  'ui.settings': 'Setări',
  'ui.share': 'Trimite',
  'ui.more': 'Mai mult',
  'ui.nice': 'Bravo',
  'ui.achievement': 'Realizare',
  'ui.level': 'Nivelul {level}',
  'ui.levelProgress': 'Nivelul {level}, {into} din {span} până la următorul',
  'ui.people': {
    one: 'o persoană',
    few: '{count} persoane',
    other: '{count} de persoane',
  },
} satisfies Record<string, Message>;
