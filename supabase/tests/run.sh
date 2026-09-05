#!/usr/bin/env bash
# Applies every migration to a scratch database and runs the RLS matrix against
# it. No Docker, no pgtap, no Supabase CLI — just Postgres, so it runs the same
# in CI as it does on a laptop.
#
#   supabase/tests/run.sh                 # uses a local postgres
#   PGDATABASE=rounds_ci supabase/tests/run.sh
set -euo pipefail

DB="${PGDATABASE:-rounds_test}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Postgres roles rarely match the shell user. Set PGUSER, or let this find the
# usual local superuser, so `npm run db:test` works without a setup ritual.
if [ -z "${PGUSER:-}" ] && ! psql -lqt >/dev/null 2>&1; then
  for candidate in postgres "$(id -un)"; do
    if PGUSER="$candidate" psql -lqt >/dev/null 2>&1; then
      export PGUSER="$candidate"
      break
    fi
  done
fi

dropdb --if-exists "$DB"
createdb "$DB"
psql -q -d "$DB" -c "create role authenticated nologin;" || true
psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/local-harness.sql"

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "  apply $(basename "$f")"
  psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$f"
done

HARNESS="$ROOT/supabase/tests/harness.sql"

echo "  running RLS matrix"
psql -q -d "$DB" -v ON_ERROR_STOP=1 -v harness="$HARNESS" -f "$ROOT/supabase/tests/rls_matrix.sql"

# Behaviour, not access control. Runs on a database the matrix has already
# written to, so it cleans up after itself rather than assuming an empty one.
echo "  running safety escalation"
psql -q -d "$DB" -v ON_ERROR_STOP=1 -v harness="$HARNESS" -f "$ROOT/supabase/tests/safety_escalation.sql"
