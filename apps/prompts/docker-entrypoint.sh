#!/bin/sh
set -eu

mkdir -p /app/data
chown -R astro:nodejs /app/data

if [ "$#" -gt 0 ]; then
  exec su-exec astro "$@"
fi

exec su-exec astro node ./dist/server/entry.mjs
