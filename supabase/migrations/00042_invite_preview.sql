/**
 * What a person who does not have the app is allowed to see about an invite.
 *
 * `public/n.html` is the app's only surface for people who have not installed
 * it, which makes it the growth loop rather than a fallback — and it shipped
 * with somebody else's evening hard-coded into it. "Friday, properly", "Friday
 * 21:30 · Roots", and three avatars reading AM/TU/MP: the demo seed, rendered
 * to every real invite anybody sent, in the OG tags as well as on the page. The
 * `id="title"` and `id="when"` hooks were there; the only script rewrote the
 * deep link.
 *
 * This is what fills them. Deliberately narrow, because the audience is
 * ANONYMOUS — no auth, no RLS, whoever has the link:
 *
 *   · a title, a start time, a venue name, and how many people are in;
 *   · never a name, an id, a handle or an avatar of anybody in it;
 *   · never a private night, and never a plan whose link was not shared.
 *
 * Anyone with the link can call it. That is the point of a link, and it is also
 * why it returns as little as it does — a join code is eight characters, and
 * eight characters must not be enough to enumerate a city's social graph.
 */
create or replace function public.invite_preview(p_kind text, p_code text)
returns table (
  title text,
  starts_at timestamptz,
  venue text,
  people integer
)
language sql stable security definer set search_path = public
as $$
  select * from (
    -- A night, by its join code.
    select coalesce(s.title, '') as title,
           s.started_at          as starts_at,
           v.name                as venue,
           (select count(*)::integer from public.session_participants sp
             where sp.session_id = s.id) as people
      from public.sessions s
      left join public.venues v on v.id = s.venue_id
     where p_kind = 'n'
       and s.join_code = upper(p_code)
       and s.visibility <> 'private'
       and s.ended_at is null

    union all

    -- A plan, by its id. Shared by link, so the id IS the credential.
    select p.title,
           p.starts_at,
           (select v2.name from public.plan_venues pv
              join public.venues v2 on v2.id = pv.venue_id
             where pv.plan_id = p.id
             order by pv.created_at limit 1),
           (select count(*)::integer from public.plan_invitees pi
             where pi.plan_id = p.id and pi.rsvp = 'yes')
      from public.plans p
     where p_kind = 'p'
       and p.id::text = p_code
       and p.starts_at > now() - interval '12 hours'
  ) preview
  limit 1;
$$;

revoke all on function public.invite_preview(text, text) from public;
grant execute on function public.invite_preview(text, text) to anon, authenticated;
