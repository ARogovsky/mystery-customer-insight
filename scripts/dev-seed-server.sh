#!/usr/bin/env bash
# Запуск dev-сервера для просмотра сид-данных (Docker-БД mci), Node 24 через nvm, порт 3001.
# Используется вручную / для сид-режима. Не для прода.
set -e
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 24 >/dev/null
export PORT=3001
exec npm run dev:next
