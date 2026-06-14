#!/bin/bash
cd ~/ledger-sync
# Ensure credential helper is set (should be done once)
if ! git config --global credential.helper >/dev/null 2>&1; then
  git config --global credential.helper store
fi
# URL without credentials
REPO="https://github.com/gremlinbooks/ctn-brain.git"
git remote set-url origin "$REPO" 2>/dev/null
git pull origin main --rebase 2>/dev/null
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Morty sync: $(date '+%Y-%m-%d %H:%M')"
fi
git push origin HEAD 2>/dev/null
