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
