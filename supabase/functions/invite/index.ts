import { admin } from '../_shared/db.ts';

/**
 * Renders the invite page with the real invitation in it.
 *
 * `public/n.html` is the app's only surface for somebody who has not installed
 * it, so it is the growth loop rather than a fallback — and a link preview in a
 * group chat is most of that loop. A crawler does not run JavaScript, so the
 * page's own fetch cannot fill the OG tags; only a server can, which is what
 * this is.
 *
 * The page shipped for a long time with the demo seed baked into it: "Friday,
 * properly", "21:30 at Roots", three avatars reading AM/TU/MP. Every invite
 * anybody sent previewed as a stranger's fictional evening.
 *
 * Route: /n/:code (a night) and /p/:id (a plan).
 *
 * What it does NOT do is as deliberate as what it does. It calls
 * `invite_preview`, which returns a title, a time, a venue name and a count —
 * no names, no handles, no avatars, no ids. The audience is whoever has the
 * link, and three initials on a public page are three people who did not agree
 * to be on it.
 */

const PAGE_URL = Deno.env.get('INVITE_PAGE_URL') ?? 'https://rounds.app/n.html';

/** The template, fetched once per isolate rather than per request. */
let template: string | null = null;

async function page(): Promise<string> {
  if (template) return template;
  const res = await fetch(PAGE_URL);
  if (!res.ok) throw new Error(`invite template ${res.status}`);
  template = await res.text();
  return template;
}

/**
 * Everything substituted into the page goes through this.
 *
 * The values come from a database this function does not control the contents
 * of — a night's title is whatever somebody typed — and they land inside both
 * an HTML body and an HTML attribute. Escaping both contexts is the difference
 * between a title and a script tag.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function when(startsAt: string | null, venue: string | null): string {
  const parts: string[] = [];
  if (startsAt) {
    parts.push(
      new Date(startsAt).toLocaleString('en-GB', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })
    );
  }
  if (venue) parts.push(venue);
  return parts.join(' · ');
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const code = parts.pop() ?? '';
  const kind = url.pathname.includes('/n/') ? 'n' : 'p';

  let html = await page();

  // Neutral by default. A link to something that has ended, or that was never
  // shared, is still a page about ROUNDS — it is simply not about that night,
  // and it says nothing it cannot support.
  let title = 'A night out';
  let sub = 'Open the app for the details';
  let ogDescription = 'An invitation from someone using ROUNDS';
  let people = 0;

  if (code) {
    const { data } = await admin().rpc('invite_preview', { p_kind: kind, p_code: code });
    const preview = Array.isArray(data) ? data[0] : null;
    if (preview) {
      if (preview.title) title = preview.title;
      const line = when(preview.starts_at, preview.venue);
      if (line) {
        sub = line;
        ogDescription = line;
      }
      people = Number(preview.people ?? 0);
    }
  }

  html = html
    .replaceAll('{{TITLE}}', esc(title))
    .replaceAll('{{WHEN}}', esc(sub))
    .replaceAll('{{OG_TITLE}}', esc(title))
    .replaceAll('{{OG_DESCRIPTION}}', esc(ogDescription))
    // The static fallback's configuration markers. This path has already filled
    // the page from the database, so the browser has nothing left to ask for —
    // and an unsubstituted marker left in an attribute is a template leak on a
    // public page.
    .replaceAll('{{SUPABASE_URL}}', '')
    .replaceAll('{{SUPABASE_ANON_KEY}}', '');

  if (people > 0) {
    html = html.replace(
      '<div class="card" id="whoCard" hidden>',
      '<div class="card" id="whoCard">'
    ).replace(
      '<p class="sub" id="who" style="margin:8px 0 0"></p>',
      `<p class="sub" id="who" style="margin:8px 0 0">${esc(
        people === 1 ? '1 person in' : `${people} people in`
      )}</p>`
    );
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Short, because "who's in" changes during an evening, and long enough
      // that a link pasted into a busy group chat is not a thundering herd.
      'Cache-Control': 'public, max-age=60',
    },
  });
});
