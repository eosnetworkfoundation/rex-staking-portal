#!/bin/bash
set -eo pipefail

function ee()
{
    echo "$ $*"
    eval "$@"
}

exec 9>&1 # enable tee to write to STDOUT as a file
# print debugging code
ee node --version
ee yarn --version
ee npm --version
# add metadata
echo 'Packing website metadata into distribution.'
cat package.json | jq \
    --arg actor "$GITHUB_ACTOR" \
    --arg branch "$(git branch --show-current)" \
    --arg branchFromTag "$(git branch --contains 'tags/v0.1.0' | tail -n +2 | tail -n 1 | tr -d '[:space:]')" \
    --arg build "$GITHUB_RUN_NUMBER" \
    --arg build_id "$GITHUB_RUN_ID" \
    --arg commit "$(git rev-parse HEAD)" \
    --arg email "$(git log -n 1 --pretty=format:%ae)" \
    --arg node "$(node --version)" \
    --arg ref_type "$GITHUB_REF_TYPE" \
    --arg repo "$GITHUB_SERVER_URL/$GITHUB_REPOSITORY" \
    --arg tag "$(git --no-pager tag --points-at HEAD)" \
    --arg triggering_actor "$GITHUB_TRIGGERING_ACTOR" \
    '.git += {
        $actor,
        branch: (if $branch != "" then $branch elif $branchFromTag != "" then $branchFromTag else null end),
        build: ($build | tonumber),
        build_id: ($build_id | tonumber),
        build_url: ($repo + "/actions/runs/" + $build_id),
        $commit,
        $email,
        $node,
        $ref_type,
        $repo,
        tag: ($tag | if . == "" then null else . end),
        $triggering_actor
    }' > temp.json
mv temp.json package.json
ee 'cat package.json | jq .git'
# generate static site
ee yarn build
# package website
ee 'yarn pack'
PACKAGE_NAME="$(cat package.json | jq -r '.name' | tr -d '@' | tr '/' '-')"
PACKAGE_VERSION="$(cat package.json | jq -r '.version')"
PACKAGE_TAR="$PACKAGE_NAME-v$PACKAGE_VERSION.tgz"
mv "$PACKAGE_TAR" dist.tar.gz
echo "Done. - ${BASH_SOURCE[0]}"
