#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

if ! command -v mkcert > /dev/null; then
  echo "mkcert absent. Installer : sudo apt install -y mkcert && mkcert -install" >&2
  exit 1
fi

HOST="$(hostname).local"
LAN_IPS="$(ip -4 -o addr show scope global 2>/dev/null | grep -vE ' (docker|br-|veth)' | grep -oP 'inet \K[\d.]+' || true)"

mkdir -p certs
# shellcheck disable=SC2086
mkcert -cert-file certs/dev.pem -key-file certs/dev-key.pem \
  "$HOST" localhost 127.0.0.1 ::1 $LAN_IPS

echo
echo "Serveur accessible sur https://$HOST:5173/"
for IP in $LAN_IPS; do echo "                  et https://$IP:5173/"; done
