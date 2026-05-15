#!/usr/bin/env sh
set -e
# Sempre usa a raiz do Git (mono-repo), assim o comando funciona mesmo com Root Directory
# no painel apontando para frontend/ ou outra pasta.
root=$(git rev-parse --show-toplevel 2>/dev/null) || root=""
if [ -z "$root" ]; then
  echo "vercel-ci: nao achei raiz do Git. No painel Vercel, deixe Root Directory vazio (raiz do repositorio)." >&2
  exit 1
fi
cd "$root" || exit 1
if [ ! -f frontend/package.json ]; then
  echo "vercel-ci: falta frontend/package.json em $root" >&2
  exit 1
fi
exec npm install --prefix frontend
