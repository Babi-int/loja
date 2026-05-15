#!/usr/bin/env sh
set -e
root=$(git rev-parse --show-toplevel 2>/dev/null) || root=""
if [ -z "$root" ]; then
  echo "vercel-ci: nao achei raiz do Git. No painel Vercel, deixe Root Directory vazio (raiz do repositorio)." >&2
  exit 1
fi
cd "$root" || exit 1
exec npm run build --prefix frontend
