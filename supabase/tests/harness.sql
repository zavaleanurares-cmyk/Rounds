-- ============================================================================
-- The assertion harness.
--
-- Plain SQL on purpose: no pgtap, no extensions, so every test file in this
-- directory runs against a bare Postgres in CI, in a Supabase branch, or on a
-- laptop. Shared by rls_matrix.sql and safety_escalation.sql so the two report
-- their results the same way.
--
-- Every assertion does two things: it records a row in `t.results` for the
-- summary, and it RAISES on failure so the run stops at the first wrong answer
-- rather than printing a wall of consequences.
-- ============================================================================

set client_min_messages = warning;

create schema if not exists t;

create table if not exists t.results (n serial, name text, ok boolean);
truncate t.results;

create or replace function t.check(name text, actual boolean, expected boolean)
returns void language plpgsql as $$
begin
  insert into t.results (name, ok) values (name, actual is not distinct from expected);
  if actual is distinct from expected then
    raise exception 'FAIL: % (expected %, got %)', name, expected, actual;
  end if;
end;
$$;

create or replace function t.count_eq(name text, actual bigint, expected bigint)
returns void language plpgsql as $$
begin
  insert into t.results (name, ok) values (name, actual = expected);
  if actual <> expected then
    raise exception 'FAIL: % (expected % rows, got %)', name, expected, actual;
  end if;
end;
$$;

create or replace function t.rejects(name text, stmt text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
    insert into t.results (name, ok) values (name, false);
    raise exception 'FAIL: % (statement was allowed and should not have been)', name;
  exception
    when others then
      if sqlerrm like 'FAIL:%' then raise; end if;
      insert into t.results (name, ok) values (name, true);
  end;
end;
$$;

/** Asserts a text value, for the cases where a boolean loses the detail. */
create or replace function t.text_eq(name text, actual text, expected text)
returns void language plpgsql as $$
begin
  insert into t.results (name, ok) values (name, actual is not distinct from expected);
  if actual is distinct from expected then
    raise exception 'FAIL: % (expected %, got %)', name, expected, actual;
  end if;
end;
$$;

/** The summary every test file ends with. */
create or replace function t.summary(label text)
returns void language plpgsql as $$
declare failed integer;
begin
  select count(*) into failed from t.results where not ok;
  if failed > 0 then raise exception '% assertions failed in %', failed, label; end if;
  raise notice '%: all % assertions passed', label, (select count(*) from t.results);
end;
$$;
