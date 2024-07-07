#!/bin/bash
set -eo pipefail
if [[ "$GITHUB_REF_TYPE" == 'tag' ]]; then
    echo "Found git $GITHUB_REF_TYPE \"$GITHUB_REF_NAME,\" attempting a production deployment."
    export GIT_TAG="$(git --no-pager tag --points-at HEAD)"
    export FRONTEND_VERSION="v$(cat frontend/package.json | jq -r '.version')"
    if [[ "$FRONTEND_VERSION" != "$GIT_TAG" || "$GIT_TAG" != "$GITHUB_REF_NAME" ]]; then
        echo '::error title=Version String Mismatch:: Frontend package.json version string does not match the git tag!'
        echo "FRONTEND_VERSION='$FRONTEND_VERSION'"
        echo "GITHUB_REF_NAME='$GITHUB_REF_NAME'"
        echo "GIT_TAG='$GIT_TAG'"
        cat frontend/package.json | jq '.'
        exit 10
    fi
    echo '::notice title=Deploying to Production::This build will attempt to deploy to production. This is the real deal!'
    echo '::set-output name=dry-run::false'
    echo "::set-output name=role-arn::$DEVHUB_FRONTEND_PROD_IAM_ARN"
else
    echo "Found git $GITHUB_REF_TYPE \"$GITHUB_REF_NAME,\" performing a dry-run."
    echo '::notice title=Dry Run::This build is performing a dry run. A dry run attemps to verify everything is good to go without actually changing anything.'
    echo '::set-output name=dry-run::true'
    echo "::set-output name=role-arn::$DEVHUB_FRONTEND_RO_IAM_ARN"
fi
echo 'Done. - frontend-aws-role.sh'
