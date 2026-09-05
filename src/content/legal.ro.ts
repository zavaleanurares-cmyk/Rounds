import type { LegalDoc } from './legal';

/**
 * Versiunea în limba română a documentelor juridice ROUNDS.
 *
 * ĂSTA E UN DRAFT PENTRU AVOCAT, NU E CONSULTANȚĂ JURIDICĂ. Nu se publică fără
 * o verificare.
 *
 * Versiunea în engleză (`legal.ts`) este singura care face lege. Traducerea
 * asta există ca oamenii să își poată citi condițiile în limba lor; dacă apare
 * vreo neconcordanță, engleza e cea care contează, iar fiecare document o spune
 * chiar de la început (vezi `PREVAILS` în `legal.ts`).
 *
 * Marcajele [DRAFT — …] rămân și în traducere: o clauză pe care avocatul nu a
 * tranșat-o nu e tranșată în nicio limbă. Cuvântul „DRAFT” rămâne în engleză —
 * el este marcajul literal după care se uită aplicația ca să afișeze bannerul
 * de avertizare (vezi `app/legal/[doc].tsx`).
 *
 * Titlurile secțiunilor, ordinea lor și data actualizării sunt identice cu cele
 * din engleză. Nicio cifră, nicio vârstă, niciun termen și mai ales niciun
 * număr de telefon nu a fost schimbat, reformatat sau localizat.
 */

const UPDATED = 'September 2026';

export const RO: Record<string, LegalDoc> = {
  terms: {
    title: 'Termeni și condiții',
    updated: UPDATED,
    sections: [
      {
        heading: 'Ce este ROUNDS',
        body: 'ROUNDS este un însoțitor pentru serile în oraș. Înregistrează ce îi spui, îți estimează ritmul de băut, te ajută să îți ții grupul laolaltă și te ajută să ajungi acasă. Nu este un dispozitiv medical, nu este un etilotest și nu este o sursă de sfaturi despre dacă ești în stare să conduci sau să folosești ceva.',
      },
      {
        heading: 'Estimarea ritmului — citește-o pe asta',
        body: 'Orice valoare a alcoolemiei afișată în ROUNDS este o ESTIMARE făcută pe baza a ceea ce ai notat, a datelor tale corporale de bază și a unor medii la nivel de populație. Nu poate ține cont de mâncare, de medicamente, de boală, de metabolismul individual, de tăria a ceea ce ți s-a turnat de fapt sau de o băutură pe care ai uitat să o notezi. Poate greși în ambele sensuri și de multe ori greșește. Nu o folosi niciodată ca să decizi dacă să conduci și nu te baza niciodată pe ea ca să decizi dacă tu sau altcineva sunteți în siguranță. Dacă ai băut, nu conduce.',
      },
      {
        heading: 'Funcțiile de siguranță nu sunt un serviciu de siguranță',
        body: 'Semnul de viață că ai ajuns cu bine trimite un mesaj persoanelor de contact pe care le-ai ales, dacă nu dai semn de viață. Este o comoditate, nu un serviciu de urgență. Depinde de telefonul tău, de baterie, de semnal și de faptul că persoanele tale de contact pot fi găsite, iar oricare dintre astea poate să cedeze. Nu contactează serviciile de urgență și nu este monitorizat de nimeni. În caz de urgență sună la 112 (UE/Regatul Unit), 911 (SUA) sau la numărul local.',
      },
      {
        heading: 'Vârsta',
        body: 'ROUNDS este pentru adulții care au vârsta legală pentru consumul de alcool în regiunea lor — 18 ani în UE, în Regatul Unit și în România, 21 de ani în Statele Unite. Verificăm data nașterii la înscriere și stocăm rezultatul pe serverele noastre, așa că reinstalarea aplicației nu îl resetează. Furnizarea unei date de naștere false este o încălcare a acestor termeni și vom închide contul.',
      },
      {
        heading: 'Contul tău și comportamentul tău',
        body: 'Ești responsabil pentru ce postezi în serile partajate și în conversațiile găștii. Hărțuirea, uzurparea identității, conținutul care sexualizează minori și orice pune o persoană în pericol sunt interzise și vor duce la închiderea contului. Poți bloca și raporta pe oricine din profilul lui; rapoartele sunt analizate de o persoană, de obicei în 24 de ore. Îți poți șterge contul oricând din Setări › Date & cont.',
      },
      {
        heading: 'Ce putem face noi',
        body: 'Putem suspenda sau închide un cont care încalcă acești termeni și putem elimina conținutul care îi încalcă. Îți vom spune de ce, în afară de cazul în care asta ar pune pe cineva în pericol sau ar încălca o obligație legală. Putem modifica acești termeni; modificările substanțiale sunt anunțate în aplicație cu cel puțin 30 de zile înainte să intre în vigoare, iar folosirea în continuare a ROUNDS după acel moment înseamnă acceptare.',
      },
      {
        heading: 'Plăți',
        body: 'ROUNDS este momentan gratuit și nu oferă nimic spre vânzare. Nu există abonament, nu există achiziții în aplicație și nu există niciun preț nicăieri în aplicație. Funcțiile de siguranță sunt gratuite pentru totdeauna și nu vor fi puse niciodată în spatele vreunei plăți de orice fel. [DRAFT — clauza asta este scrisă pentru aplicația AȘA CUM ESTE LIVRATĂ. Dacă se introduce un nivel plătit, secțiunea asta se înlocuiește cu termenii de abonament din nota de redactare de mai jos, în loc să fie modificată, și se acordă preavizul de 30 de zile cerut de „Modificări ale acestor termeni”.] [DRAFT — termeni de abonament de reintrodus când se lansează facturarea: reînnoire automată până la anulare; anularea și rambursările sunt gestionate de App Store sau de Google Play conform politicilor lor proprii, nu de noi; dreptul legal de retragere de 14 zile din UE/Regatul Unit și modul în care se exercită prin magazin; și confirmarea că siguranța rămâne în afara oricărui nivel plătit.]',
      },
      {
        heading: 'Proprietatea noastră intelectuală și a ta',
        body: 'Numele ROUNDS, aplicația, interfața ei, grafica ei și ilustrațiile ei cu băuturi sunt ale noastre și îți sunt licențiate pentru folosirea personală, necomercială, a aplicației. Tu păstrezi tot ce scrii și încarci. Publicând conținut într-o seară partajată sau într-o gașcă, ne dai o licență să îl stocăm și să îl arătăm oamenilor cu care l-ai împărtășit, atât timp cât îl ții acolo și nu mai mult. [DRAFT — avocatul trebuie să stabilească formularea licenței, să confirme dacă e nevoie de o licență mai largă pentru vreo folosire promoțională (noi am prefera să nu) și să verifice situația mărcii „ROUNDS” pe fiecare piață de lansare.]',
      },
      {
        heading: 'Răspunderea',
        body: 'ROUNDS este furnizat ca atare și în funcție de disponibilitate. În măsura maximă permisă de lege, excludem garanțiile implicite și nu răspundem pentru pierderi indirecte sau subsecvente, pentru pierderea profitului sau pentru pierderea datelor. Răspunderea noastră totală față de tine pentru toate pretențiile dintr-o perioadă de douăsprezece luni este limitată la [DRAFT — plafon de stabilit de avocat: suma pe care ne-ai plătit-o în acea perioadă, sau un prag fix pentru un utilizator gratuit, sau ambele, după cum este potrivit pentru fiecare piață]. Nimic din acești termeni nu limitează și nu exclude răspunderea pentru deces sau vătămare corporală cauzată de neglijență, pentru fraudă sau declarație frauduloasă, ori pentru orice altceva care nu poate fi limitat în mod legal. Dacă ești consumator, drepturile tale legale nu sunt afectate și nimic de aici nu trece peste ele. [DRAFT — avocatul trebuie să confirme că lista de excluderi rezistă la UK Consumer Rights Act 2015 și la directiva europeană privind clauzele abuzive (EU Unfair Terms Directive) pe fiecare piață de lansare și să spună dacă e nevoie de o clauză separată pentru utilizatorii profesioniști.]',
      },
      {
        heading: 'Legea și litigiile',
        body: 'Înainte de orice demers formal, scrie la hello@rounds.app; majoritatea lucrurilor se rezolvă așa și vom răspunde în [DRAFT — termen de răspuns, de stabilit de avocat]. Acești termeni sunt guvernați de legea din [DRAFT — legea aplicabilă, de stabilit de avocat], iar instanțele din [DRAFT — forul competent, de stabilit de avocat] au competență. Dacă ești consumator cu reședința în UE sau în Regatul Unit, asta nu te lipsește de protecția normelor imperative din propria ta țară și poți introduce acțiune la propriile tale instanțe. Consumatorii din UE pot folosi și platforma de soluționare online a litigiilor a Comisiei Europene, la ec.europa.eu/consumers/odr. [DRAFT — avocatul trebuie să stabilească legea aplicabilă și forul pentru fiecare piață de lansare, să confirme că linkul ODR este în continuare obligatoriu și actual la momentul publicării și să spună dacă o clauză de arbitraj și o renunțare la acțiunile colective sunt potrivite pentru Statele Unite și executorii având în vedere poziția de consumator din alte părți.]',
      },
      {
        heading: 'Modificări ale acestor termeni',
        body: 'Putem modifica acești termeni. Modificările substanțiale sunt anunțate în aplicație cu cel puțin 30 de zile înainte să intre în vigoare, iar folosirea în continuare a ROUNDS după acea dată înseamnă acceptare. Dacă nu accepți o modificare, îți poți șterge contul din Setări › Date & cont, iar datele tale sunt eliminate conform politicii de mai jos.',
      },
      {
        heading: 'Contact',
        body: 'ROUNDS este operat de [DRAFT — denumirea juridică completă și sediul social, care trebuie să corespundă exact cu Politica de confidențialitate și cu ambele listări din magazine]. Scrie la hello@rounds.app pentru orice sau la privacy@rounds.app despre datele tale; răspundem la adresa de la care scrii. Raportările de hărțuire sau de orice pune o persoană în pericol sunt analizate de o persoană, de obicei în 24 de ore, și poți raporta și din orice profil din aplicație.',
      },
    ],
  },

  privacy: {
    title: 'Politica de confidențialitate',
    updated: UPDATED,
    sections: [
      {
        heading: 'Cine suntem',
        body: 'Operatorul datelor cu caracter personal descrise în această politică este [DRAFT — denumirea juridică completă], o [DRAFT — formă juridică, de exemplu SRL] înregistrată în [DRAFT — țara de înregistrare] cu numărul [DRAFT — numărul de înregistrare al societății], la [DRAFT — sediul social]. Ne poți contacta la privacy@rounds.app. [DRAFT — avocatul trebuie să confirme dacă este necesar un responsabil cu protecția datelor conform Articolului 37 și, dacă da, să adauge aici datele lui de contact; și dacă sunt necesari un reprezentant în UE conform Articolului 27 și un reprezentant în Regatul Unit, adăugându-i pe fiecare cu o adresă poștală. Aceleași date trebuie să corespundă cu listările din magazine și cu Termenii.]',
      },
      {
        heading: 'Varianta scurtă',
        body: 'Stocăm ce notezi ca aplicația să ți-o poată arăta înapoi. Estimarea alcoolemiei este calculată pe telefonul tău și nu este trimisă nicăieri. Prietenii pot vedea că ai fost în oraș, niciodată ce ai băut. Nu îți vindem datele, nu le împărtășim pentru publicitate și în ROUNDS nu există publicitate. Poți exporta tot sau îți poți șterge contul din Setări › Date & cont, imediat și fără să ne ceri nouă.',
      },
      {
        heading: 'Ce stocăm și de ce',
        body: 'Profilul tău (numele afișat, numele de utilizator, avatarul) ca prietenii să te poată găsi — necesar pentru executarea contractului. Ce notezi, serile tale, planurile tale și setările tale — necesare pentru furnizarea serviciului. Datele corporale de bază (sexul și greutatea), doar dacă le dai, și doar ca să se calculeze estimarea ritmului pe dispozitivul tău — astea sunt date privind sănătatea și le prelucrăm exclusiv pe baza consimțământului tău explicit, pe care îl poți retrage golind acele câmpuri. Data nașterii, ca să verificăm vârsta legală pentru consumul de alcool — o obligație legală. Evenimente de diagnosticare, care conțin numărători și categorii și niciodată numele unei băuturi, al unui local sau al unei persoane.',
      },
      {
        heading: 'Ce nu îți părăsește niciodată telefonul',
        body: 'Estimarea alcoolemiei este calculată pe dispozitivul tău și nu este stocată niciodată pe serverele noastre și nici transmisă undeva. Potrivirea contactelor aplică un hash numerelor de telefon pe dispozitivul tău, cu o sare criptografică; se trimit doar hash-urile, iar noi nu îți păstrăm lista de contacte. Adresa ta de acasă, folosită ca să precompleteze o cursă spre casă, este stocată doar pe dispozitiv.',
      },
      {
        heading: 'Locația',
        body: 'Locația este folosită ca să îți arate localurile din apropiere și nu este stocată pe serverele noastre în acest scop. Partajarea locației tale în timp real cu o seară se face prin activare, pentru fiecare seară în parte, este vizibilă doar pentru oamenii din acea seară și este ștearsă automat când se termină seara — rândul este eliminat, nu doar ascuns. Nu cerem niciodată locația în fundal.',
      },
      {
        heading: 'Cine o mai vede',
        body: 'Nimic despre băutul tău nu este împărtășit cu nimeni dacă nu împărtășești tu. Un prieten poate vedea că ai fost în oraș și în ce localuri, doar dacă setezi o seară ca vizibilă pentru prieteni. Un prieten nu vede niciodată ce ai băut, cât, ritmul tău, seriile tale sau cheltuielile tale. Nu vindem date cu caracter personal, nu le împărtășim pentru publicitate și în ROUNDS nu există publicitate.',
      },
      {
        heading: 'Temeiuri legale',
        body: 'Contract: profilul tău, înregistrările tale, serile tale, planurile tale și setările tale — nu putem furniza aplicația fără ele. Consimțământ explicit (Articolul 9(2)(a)): sexul și greutatea ta, care privesc sănătatea și sunt folosite doar ca să se calculeze estimarea ritmului pe dispozitivul tău; îl retragi golind acele câmpuri, ceea ce oprește estimarea și nimic altceva. Obligație legală: data nașterii, ca să verificăm vârsta legală pentru consumul de alcool. Interese legitime: menținerea securității serviciului, prevenirea abuzurilor și evenimentele de diagnosticare care conțin doar numărători și categorii — te poți opune ultimelor din Setări › Confidențialitate. [DRAFT — avocatul trebuie să confirme temeiul din Articolul 9 pentru datele corporale și dacă o evaluare a intereselor legitime ar trebui consemnată și rezumată aici.]',
      },
      {
        heading: 'Subîmputerniciți',
        body: 'Supabase — bază de date, autentificare și stocare de fișiere, găzduite în UE. Expo — livrarea notificărilor push. [DRAFT — numele furnizorului de SMS], folosit doar ca să trimită o escaladare de tip „am ajuns cu bine” către persoanele de contact pe care le-ai ales. [DRAFT — avocatul trebuie să completeze lista asta înainte de lansare și, pentru fiecare intrare, să consemneze: denumirea juridică a persoanei împuternicite, ce prelucrează, unde prelucrează și mecanismul de transfer pentru orice iese din SEE sau din Regatul Unit (clauze contractuale standard plus o evaluare a impactului transferului, sau o decizie de adecvare). Avocatul trebuie să se pronunțe asupra publicării acestei liste la rounds.app/subprocessors, cu un angajament de a anunța înainte de adăugarea unei noi persoane împuternicite, ceea ce este forma pe care o așteaptă evaluatorii din companii și magazinele.]',
      },
      {
        heading: 'Cum le protejăm',
        body: 'Datele sunt criptate în tranzit și în repaus. Accesul la rândurile tale este impus de baza de date însăși, nu de aplicație, așa că o eroare în client nu poate arăta datele tale altcuiva. Nimeni de la ROUNDS nu îți citește înregistrările. [DRAFT — avocatul trebuie să confirme formularea privind notificarea încălcărilor cerută de Articolele 33 și 34 și dacă un angajament concret privind termenul de notificare ar trebui să apară aici.]',
      },
      {
        heading: 'Fără profilare, fără decizii automate',
        body: 'Nimic din ROUNDS nu ia o decizie despre tine cu efect juridic sau cu efect similar semnificativ și nu te profilăm pentru publicitate. Estimarea ritmului și mesajele de stare de bine sunt calculate pe propriul tău dispozitiv, pe baza a ceea ce ai notat, și sunt informații pentru tine, nu o judecată consemnată despre tine.',
      },
      {
        heading: 'Cât timp le păstrăm',
        body: 'Înregistrările și serile tale sunt păstrate până când le ștergi tu sau îți ștergi contul. Ștergerea contului pornește o perioadă de grație de 30 de zile, după care totul este eliminat printr-o cascadă pe server; ești deconectat imediat. Locația în timp real expiră în câteva ore. Evenimentele de diagnosticare sunt păstrate 12 luni. Raportările de moderare sunt păstrate 24 de luni, ca să poată fi recunoscut comportamentul repetat.',
      },
      {
        heading: 'Drepturile tale',
        body: 'Conform RGPD și UK GDPR, poți accesa, corecta, șterge, restricționa, te poți opune prelucrării și îți poți porta datele. Exportă tot în format JSON din Setări › Date & cont — gratuit, imediat, fără nicio cerere. Șterge-ți contul din același ecran. Poți depune plângere la propria autoritate de supraveghere: ANSPDCP în România, CNIL în Franța, AEPD în Spania, ICO în Regatul Unit, sau echivalentul de unde locuiești. [DRAFT — consilierul juridic să confirme că lista corespunde piețelor de lansare și să adauge autoritatea principală după ce se stabilește sediul principal.]',
      },
      {
        heading: 'Copii',
        body: 'ROUNDS nu este pentru nimeni sub vârsta legală pentru consumul de alcool din regiunea lui și nu colectăm cu bună știință date de la astfel de persoane. Dacă crezi că un minor are cont, scrie la privacy@rounds.app și îl vom elimina.',
      },
      {
        heading: 'Modificări ale acestei politici',
        body: 'Dacă modificăm substanțial politica asta, îți vom spune în aplicație înainte ca modificarea să intre în vigoare, iar data din capul paginii reflectă întotdeauna versiunea curentă.',
      },
      {
        heading: 'Ajutor',
        body: 'Dacă băutul îți creează probleme, ecranul Stare de bine trimite către resurse de ajutor pentru regiunea ta. Nimic din ce îi spui lui ROUNDS nu este împărtășit cu cineva din afara contului tău.',
      },
    ],
  },

  support: {
    title: 'Ajutor cu alcoolul',
    updated: UPDATED,
    sections: [
      {
        heading: 'Dacă nu mai e distractiv',
        body: 'Să vorbești cu cineva despre băut e un lucru normal și nu trebuie să fie mai întâi o criză. Medicul tău de familie e un prim apel rezonabil, iar majoritatea țărilor au o linie gratuită și confidențială.',
      },
      {
        heading: 'România',
        body: 'Alianța Română de Prevenire a Sinuciderii · 0800 801 200. Urgențe: 112.',
      },
      {
        heading: 'Regatul Unit și Irlanda',
        body: 'Drinkline · 0300 123 1110. Alcoholics Anonymous · 0800 9177 650. Urgențe: 999 / 112.',
      },
      {
        heading: 'Franța',
        body: 'Alcool Info Service · 0 980 980 930, anonim, fără suprataxă, de la 8 dimineața până la 2 noaptea, în fiecare zi. Urgențe: 112.',
      },
      {
        heading: 'Spania',
        body: 'Fad Juventud · 900 16 15 15, gratuit și confidențial. Alcohólicos Anónimos · 985 566 345. Urgențe: 112.',
      },
      {
        heading: 'Uniunea Europeană',
        body: 'Urgențe: 112. Serviciul național de sănătate din țara ta îți listează serviciile locale pentru alcool.',
      },
      {
        heading: 'Statele Unite',
        body: 'SAMHSA National Helpline · 1-800-662-4357, gratuit și confidențial, 24/7. Urgențe: 911.',
      },
    ],
  },
};
