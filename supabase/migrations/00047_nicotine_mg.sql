/**
 * The strength on the tin.
 *
 * A pouch is sold, compared and stepped down by its milligrams — Zyn 6 to
 * Zyn 3 to nothing is the single most useful thing this module can support —
 * and Romanian Law 64/2024 caps a legally sold pouch at 20 mg. The check
 * enforces that rather than trusting a client to: a row claiming 45 mg is
 * either a bug or a product that cannot be bought here.
 *
 * Null for everything else, and for cigarettes that is deliberate rather than
 * missing. EU Directive 2014/40 Article 13(1)(a) forbids printing nicotine
 * content on a cigarette pack, and recital 25 says why: the figures "proved to
 * be misleading as [they lead] consumers to believe that certain cigarettes are
 * less harmful than others". Storing a per-brand milligram figure would rebuild
 * in this app exactly what the Directive removed from the packaging. The
 * constraint below makes that structural: only a nicotine log may carry a
 * strength at all, and nothing forces one to.
 */
alter table public.consumption_logs
  add column if not exists nicotine_mg numeric(4,1);

do $$ begin
  alter table public.consumption_logs
    add constraint nicotine_mg_sane check (
      nicotine_mg is null
      or (category = 'nicotine' and nicotine_mg > 0 and nicotine_mg <= 20)
    );
exception when duplicate_object then null; end $$;
