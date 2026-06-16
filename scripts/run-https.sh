#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT/.cert"
PORT="${PORT:-8443}"
RAW_HOSTNAME="$(hostname)"
if [[ "$RAW_HOSTNAME" == *.local ]]; then
  HOSTNAME_LOCAL="$RAW_HOSTNAME"
else
  HOSTNAME_LOCAL="$RAW_HOSTNAME.local"
fi
LOCAL_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo 127.0.0.1)"

mkdir -p "$CERT_DIR"

cat > "$CERT_DIR/openssl.cnf" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = US
ST = Illinois
L = Local
O = Dachshund Dash Local
OU = Dev
CN = $HOSTNAME_LOCAL

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:TRUE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = $HOSTNAME_LOCAL
IP.1 = 127.0.0.1
IP.2 = $LOCAL_IP
EOF

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -config "$CERT_DIR/openssl.cnf" >/dev/null 2>&1

printf '\nHTTPS ready.\n'
printf 'Mac URL:    https://localhost:%s\n' "$PORT"
printf 'iPhone URL: https://%s:%s\n' "$LOCAL_IP" "$PORT"
printf 'Hostname:   https://%s:%s\n\n' "$HOSTNAME_LOCAL" "$PORT"
printf 'If Safari warns about the certificate, install and trust %s/.cert/cert.pem on the iPhone.\n\n' "$ROOT"

HOST=0.0.0.0 PORT="$PORT" node "$ROOT/scripts/serve-https.js"
