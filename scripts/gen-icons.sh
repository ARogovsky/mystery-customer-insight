#!/usr/bin/env bash
# Генерация фавиконок/иконок из logo.svg и OG-картинки из landscape.svg через resvg + magick.
# Запуск: bash scripts/gen-icons.sh  (требует resvg и imagemagick).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "favicons from logo.svg (square)…"
resvg --width 16 public/logo.svg public/favicon-16x16.png
resvg --width 32 public/logo.svg public/favicon-32x32.png
resvg --width 48 public/logo.svg /tmp/mci-favicon-48.png
resvg --width 180 public/logo.svg public/apple-touch-icon.png
resvg --width 192 public/logo.svg public/android-chrome-192x192.png
resvg --width 512 public/logo.svg public/android-chrome-512x512.png

echo "favicon.ico (multi-resolution)…"
magick public/favicon-16x16.png public/favicon-32x32.png /tmp/mci-favicon-48.png public/favicon.ico

echo "svg favicon…"
cp public/logo.svg public/favicon.svg

echo "og-image from landscape.svg (1200 wide, aspect preserved)…"
resvg --width 1200 public/landscape.svg public/og-image.png

echo "done"
