import { LEGAL, LEGAL_DOCS } from '@/content/legal';
import { readFileSync } from 'node:fs';

/**
 * The legal copy is a draft for counsel, and these assertions exist to keep it
 * a USEFUL one. The failure mode they guard against is the ordinary one: a
 * marker gets deleted along with the text around it, or a section quietly
 * becomes a placeholder again, and nobody notices until a store reviewer does.
 */

const DRAFT = /\[DRAFT/;
const sections = Object.values(LEGAL).flatMap((d) => d.sections);

describe('the legal documents', () => {
  it('has terms, a privacy policy and support resources', () => {
    expect(LEGAL_DOCS).toEqual(expect.arrayContaining(['terms', 'privacy', 'support']));
  });

  it('gives every section a heading and a body', () => {
    for (const s of sections) {
      expect(s.heading.trim().length).toBeGreaterThan(0);
      expect(s.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate headings within a document', () => {
    for (const [name, doc] of Object.entries(LEGAL)) {
      const headings = doc.sections.map((s) => s.heading);
      expect(new Set(headings).size).toBe(headings.length);
      expect(name).toBeTruthy();
    }
  });

  /**
   * The whole point of the rewrite. A section is allowed to contain a marker;
   * it is not allowed to BE one. Counsel should be editing a clause, not
   * writing one from a note.
   */
  it('no section is nothing but a placeholder', () => {
    const thin: Array<{ heading: string; left: number }> = [];
    for (const s of sections) {
      if (!DRAFT.test(s.body)) continue;
      // Substantive prose must survive with every marker removed. A clause that
      // vanishes when you delete its markers was never a clause.
      const left = s.body.replace(/\[DRAFT[^\]]*\]/g, '').replace(/\s+/g, ' ').trim().length;
      if (left < 60) thin.push({ heading: s.heading, left });
    }
    expect(thin).toEqual([]);
  });

  /**
   * There are two legitimate kinds of marker and they look different:
   *
   *   · a BLANK — "[DRAFT — registered address]" — a field inside a finished
   *     sentence, which counsel fills in;
   *   · a NOTE — a paragraph asking a specific question per launch market,
   *     which counsel answers.
   *
   * What is not legitimate is the third kind: a bare "[DRAFT]" or a "TBD" that
   * tells the reader only that somebody stopped writing.
   */
  it('every marker is a named blank or a specific instruction, never a TBD', () => {
    const markers = sections.flatMap((s) => s.body.match(/\[DRAFT[^\]]*\]/g) ?? []);
    expect(markers.length).toBeGreaterThan(0);
    const bad = markers.filter((m) => {
      if (!/^\[DRAFT\s+—\s+\S/.test(m)) return true;           // bare, or no instruction
      if (/\bTBD\b|\bTODO\b|\bXXX\b/i.test(m)) return true;    // says nothing useful
      const inner = m.slice('[DRAFT —'.length, -1).trim();
      return inner.split(/\s+/).length < 2;                     // one word is not a field
    });
    expect(bad).toEqual([]);
  });

  it('the banner is driven by the markers, so the two cannot drift apart', () => {
    const screen = readFileSync('app/legal/[doc].tsx', 'utf8');
    expect(screen).toContain("s.body.includes('[DRAFT')");
  });

  it('still warns, because the documents are still drafts', () => {
    const anyDraft = sections.some((s) => DRAFT.test(s.body));
    expect(anyDraft).toBe(true);
  });

  /** The two disclaimers the product cannot ship without. */
  it('says plainly that the estimate is not a breathalyser', () => {
    const terms = LEGAL.terms.sections.map((s) => s.body).join(' ');
    expect(terms).toMatch(/not a breathalyser/i);
    expect(terms).toMatch(/do not drive/i);
  });

  it('says plainly that the check-in is not an emergency service', () => {
    const terms = LEGAL.terms.sections.map((s) => s.body).join(' ');
    expect(terms).toMatch(/not an emergency service/i);
    expect(terms).toMatch(/112/);
  });

  it('promises safety is never behind a payment, in both documents', () => {
    const terms = LEGAL.terms.sections.map((s) => s.body).join(' ');
    expect(terms).toMatch(/free forever/i);
  });

  /**
   * The Terms describe the app as shipped. While billing is hidden they must
   * not promise a subscription that cannot be bought.
   */
  it('does not describe a paid tier the app does not offer', () => {
    const flags = readFileSync('src/config/flags.ts', 'utf8');
    if (!/BILLING_VISIBLE = false/.test(flags)) return;
    const payments = LEGAL.terms.sections.find((s) => s.heading === 'Payments');
    expect(payments).toBeDefined();
    // The live prose says there is nothing for sale; the future terms are
    // parked inside a marker rather than presented as current.
    const live = payments!.body.replace(/\[DRAFT[^\]]*\]/g, '');
    expect(live).toMatch(/currently free|nothing for sale/i);
    expect(live).not.toMatch(/renew|refund|withdraw/i);
  });

  it('names a supervisory authority a user can actually complain to', () => {
    const privacy = LEGAL.privacy.sections.map((s) => s.body).join(' ');
    expect(privacy).toMatch(/supervisory authority/i);
  });

  it('covers the sections a store review and a GDPR reviewer both look for', () => {
    const headings = LEGAL.privacy.sections.map((s) => s.heading.toLowerCase());
    for (const expected of [
      'who we are',
      'legal bases',
      'subprocessors',
      'how long we keep it',
      'your rights',
      'children',
    ]) {
      expect(headings).toContain(expected);
    }
  });
});

describe('the translated documents', () => {
  const { legalDoc } = require('@/content/legal') as typeof import('@/content/legal');
  const LOCALES = ['en', 'fr', 'ro', 'es'] as const;

  it('exists in every language, for every document', () => {
    for (const doc of LEGAL_DOCS) {
      for (const locale of LOCALES) {
        const d = legalDoc(doc, locale);
        expect({ doc, locale, sections: d.sections.length }).toEqual({
          doc,
          locale,
          sections: expect.any(Number),
        });
        expect(d.sections.length).toBeGreaterThan(0);
        for (const s of d.sections) {
          expect(s.heading.trim()).not.toBe('');
          expect(s.body.trim()).not.toBe('');
        }
      }
    }
  });

  it('opens every translation by saying the English is the operative version', () => {
    for (const doc of LEGAL_DOCS) {
      for (const locale of ['fr', 'ro', 'es'] as const) {
        const first = legalDoc(doc, locale).sections[0].body;
        expect(first).toMatch(/anglais|engleză|inglés/i);
      }
      // ...and does not say it in the English one, where it would be nonsense.
      expect(legalDoc(doc, 'en').sections[0].body).not.toMatch(/operative version/i);
    }
  });

  it('carries the same [DRAFT] markers in every language', () => {
    for (const doc of LEGAL_DOCS) {
      const count = (l: 'en' | 'fr' | 'ro' | 'es') =>
        legalDoc(doc, l)
          .sections.map((s) => (s.body.match(/\[DRAFT/g) ?? []).length)
          .reduce((a, b) => a + b, 0);
      for (const locale of ['fr', 'ro', 'es'] as const) {
        expect({ doc, locale, markers: count(locale) }).toEqual({
          doc,
          locale,
          markers: count('en'),
        });
      }
    }
  });

  /**
   * The load-bearing test in this file.
   *
   * These are numbers a person in trouble may dial. A digit transposed by a
   * translator is the one bug in this app that could do real harm, so the
   * numbers are asserted literally, per region, in every language — not by
   * comparing translations to each other, which would happily agree on the
   * same wrong number.
   */
  describe('the helplines', () => {
    const EXPECTED: Record<string, string[]> = {
      Romania: ['0800 801 200', '112'],
      'United Kingdom & Ireland': ['0300 123 1110', '0800 9177 650', '999', '112'],
      France: ['0 980 980 930', '112'],
      Spain: ['900 16 15 15', '985 566 345', '112'],
      'European Union': ['112'],
      'United States': ['1-800-662-4357', '911'],
    };

    const support = (l: 'en' | 'fr' | 'ro' | 'es') => legalDoc('support', l);

    it('lists all six regions, in the same order, in every language', () => {
      const english = support('en').sections.map((s) => s.heading);
      for (const locale of ['fr', 'ro', 'es'] as const) {
        // +1 for the prepended "English prevails" section.
        expect(support(locale).sections.length).toBe(english.length + 1);
      }
    });

    it('carries every number, digit for digit, in every language', () => {
      const englishSections = support('en').sections;
      for (const [region, numbers] of Object.entries(EXPECTED)) {
        const index = englishSections.findIndex((s) => s.heading === region);
        expect({ region, found: index >= 0 }).toEqual({ region, found: true });

        for (const locale of ['en', 'fr', 'ro', 'es'] as const) {
          const sections = support(locale).sections;
          // The translations carry one extra section at the top.
          const body = sections[locale === 'en' ? index : index + 1].body;
          for (const number of numbers) {
            expect({ region, locale, number, present: body.includes(number) }).toEqual({
              region,
              locale,
              number,
              present: true,
            });
          }
        }
      }
    });

    it('never reformats a number — no locale invents its own spacing', () => {
      // A French translator writing "09 80 98 09 30" would be following French
      // convention and would break the tel: link and the reader's expectation
      // of what to dial.
      for (const locale of ['en', 'fr', 'ro', 'es'] as const) {
        const all = support(locale).sections.map((s) => s.body).join(' ');
        expect(all).not.toMatch(/09 80 98 09 30/);
        expect(all).not.toMatch(/900 161 515/);
      }
    });
  });
});
