#!/bin/bash
set -eo pipefail
function ee {
    printf "\e[2m$ %s\e[0m\n" "$*"
    eval "$@"
}

echo 'Starting local Caddy web server.'
echo -e '\e[1;35mURL: https://localhost:8443\e[0m'
echo -e '\e[1;93mPress [Ctrl] + C to exit...\e[0m'

ee "docker run -v \"\$(git rev-parse --show-toplevel):/http\" -w '/http' -p '8443:8443' caddy caddy run --config caddyfile"
