# Translation glossary

The terms that appear across the whole app. Consistency matters more than
elegance here: a person who reads "seară" on one screen and "noapte" on the next
does not think the copy is varied, they think the app is sloppy.

## Register

**Informal everywhere, in all three languages.** ROUNDS is for people in their
twenties deciding where to go on a Friday.

| | |
|---|---|
| French | **tu**, never *vous*. Imperatives: *Commence*, *Note*, *Rentre*. |
| Romanian | **tu**, never *dumneavoastră*. Imperatives: *Începe*, *Notează*, *Mergi*. |
| Spanish | **tú**, never *usted*. Peninsular. Imperatives: *Empieza*, *Apunta*, *Vuelve*. |

The one exception is the safety escalation SMS, which is read by someone else —
possibly a parent. It stays plain and neutral rather than matey.

## The core nouns

| English | Français | Română | Español |
|---|---|---|---|
| a night (out) | une soirée | o seară | una noche |
| tonight | ce soir | diseară | esta noche |
| the night (the session) | la soirée | seara | la noche |
| a drink (one logged) | un verre | o băutură | una copa |
| to log (a drink) | noter | a nota | apuntar |
| logged | noté | notat | apuntado |
| pace | le rythme | ritmul | el ritmo |
| a round | une tournée | un rând | una ronda |
| a plan | un plan | un plan | un plan |
| a crew | une bande | o gașcă | una peña |
| a venue / place | un lieu | un local | un sitio |
| a friend | un ami | un prieten | un amigo |
| spend | les dépenses | cheltuielile | el gasto |
| a streak | une série | o serie | una racha |
| a dry night | une soirée sans alcool | o seară fără alcool | una noche sin alcohol |
| water | de l'eau | apă | agua |
| a trusted contact | un contact de confiance | o persoană de încredere | un contacto de confianza |
| a check-in | un signe de vie | un semn de viață | un aviso |
| home | rentré | acasă | en casa |
| an estimate | une estimation | o estimare | una estimación |
| a level | un niveau | un nivel | un nivel |
| an achievement | une réussite | o realizare | un logro |

**"Crew"** is the hard one. It is a small named group of friends, not a club and
not a team. *une bande* (fr), *o gașcă* (ro) and *una peña* (es) all carry the
right informality; *équipe*, *echipă* and *equipo* do not — those are sports.

**"Round"** means the round of drinks you buy for the table. *une tournée*,
*un rând* and *una ronda* are all the ordinary word for exactly that.

## The pace words

Shown in capitals inside the ring, so keep them SHORT — four to nine characters.
They describe the person's rate relative to their own usual, never a judgement.

| | EASY | STEADY | QUICK | SLOW DOWN |
|---|---|---|---|---|
| fr | TRANQUILLE | RÉGULIER | RAPIDE | RALENTIS |
| ro | LEJER | CONSTANT | RAPID | ÎNCETINEȘTE |
| es | TRANQUILO | ESTABLE | RÁPIDO | MÁS DESPACIO |

## Fixed rules

1. **ROUNDS is never translated and never declined.** Not *ROUNDS-ul*, not
   *le ROUNDS*. It is a name.
2. **Cocktail names are never translated.** A Negroni is a Negroni in every
   language. Generic drink descriptions are: "Pint of lager" → *pinte de blonde*
   / *halbă de bere blondă* / *jarra de rubia*.
3. **Never invent a claim the English does not make.** The pace copy in
   particular is carefully hedged; keep every hedge.
4. **The estimate disclaimer is load-bearing.** "Never use this to decide
   whether to drive" must be as blunt in translation as it is in English.
   No softening, no conditional, no *en principe*.
5. **Keep the em dashes and the sentence rhythm.** The copy is written to be
   read at 1am; short sentences, no subordinate clauses stacked up.
6. **Do not translate a placeholder.** `{count}`, `{name}`, `{venue}` stay
   exactly as they are.
7. **Uppercase section headers stay uppercase** where the English is uppercase.

## Romanian specifics

- Comma-below diacritics: **ș** U+0219 and **ț** U+021B. Never the Turkish
  cedilla ş U+015F / ţ U+0163. They look almost identical and render as
  different letters in several fonts.
- Three plural forms. Above nineteen the noun takes **de**: *o seară*,
  *2 seri*, *20 de seri*. The `other` form is the one that carries *de*.
- *diseară* for "tonight", not *în seara asta*.

## French specifics

- **Zero is singular**: *0 verre*, not *0 verres*. The `one` form covers 0 and 1.
- Use *on* rather than *nous* for the app's voice — *on n'a pas pu joindre
  ROUNDS*, not *nous n'avons pas pu*.
- No space before `?` and `!` in the app's copy — the typographic thin space
  does not survive every font in the stack, and a visible gap looks like a bug.

## Spanish specifics

- Peninsular. *vosotros* where a plural you is needed.
- Opening `¿` and `¡` are required. *¿Ya estás en casa?*
- Do not group four-digit numbers — that is handled by the formatter, but do
  not write "1.234" into copy.
