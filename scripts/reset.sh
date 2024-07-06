#!/bin/bash
set -eo pipefail

function ee()
{
    echo "$ $*"
    eval "$@" || :
}

echo 'Resetting nodeJS environment...'
NPM_ROOT="$(npm run env | grep '^PWD' | cut -d '=' -f '2')"
pushd "$NPM_ROOT"
ee 'jest --clearCache'
ee 'rm -r coverage node_modules'
ee 'yarn cache clean'
echo 'nodeJS environment sanitized.'
popd
echo "Done. - ${BASH_SOURCE[0]}"
