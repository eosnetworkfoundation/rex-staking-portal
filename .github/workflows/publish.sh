#!/bin/bash
set -eo pipefail

function ee()
{
    echo "$ $*"
    eval "$@"
}

exec 9>&1 # enable tee to write to STDOUT as a file
ee 'aws --version'
ee 'git log -1'
ee "git branch --contains 'tags/$(git --no-pager tag --points-at HEAD)' || :"
echo 'Finding newest matrix artifact.'
ee 'ls -la'
export DIST_DL_FOLDER="$(find . -maxdepth '1' -name 'dist*' -type 'd' | sort -r | head -n '1')"
echo "Identified \"$DIST_DL_FOLDER\" as the matrix build artifact from the most recent nodeJS version, unpacking."
ee "pushd '$DIST_DL_FOLDER'"
ee 'tar -xzf dist.tar.gz'
ee 'pushd dist'
ee 'ls -la'
echo 'Uploading website distribution to Amazon S3.'
export S3_SYNC='aws s3 sync "." "s3://$S3_BUCKET" --delete'
if [[ "$DRY_RUN" != 'false' ]]; then
    export S3_SYNC="$S3_SYNC --dryrun"
fi
ee "$S3_SYNC"
echo 'Tagging website objects.'
export TAGS="$(jq -n -c --argjson git "$(cat package.json | jq -c .git)" '{"billing-use": "devrel", "branch": ($git | .branch | tostring), "build-url": ($git | .build_url), "commit": ($git | .commit), "email": ($git | .email), "manual": "false", "tag": ($git | .tag | tostring), "terraform": "false"}')"
ee 'echo "$TAGS" | jq .'
export AWS_TAG_FORMAT="$(echo "$TAGS" | jq -c '{TagSet: (. | to_entries)}' | sed 's/"key"/"Key"/g' | sed 's/"value"/"Value"/g')"
export S3_LIST='aws s3api list-objects-v2 --bucket "$S3_BUCKET" --query "Contents[].{Key:Key}" --output text'
export S3_TAG_OBJECT='aws s3api put-object-tagging --bucket "$S3_BUCKET"'
if [[ "$DRY_RUN" != 'false' ]]; then
    echo 'AWS CLI dry run support is inconsistent and this command does not have it, printing object tag command with no dry run.'
    for OBJECT in $(eval "$S3_LIST")
    do
        echo "$ $S3_TAG_OBJECT --key '$OBJECT' --tagging '$AWS_TAG_FORMAT'"
    done
else
    for OBJECT in $(eval "$S3_LIST")
    do
        ee "$S3_TAG_OBJECT --key '$OBJECT' --tagging '$AWS_TAG_FORMAT'"
    done
fi
echo 'Refreshing AWS Cloudfront (CDN) Edge Nodes'
export AWS_CDN_REFRESH="aws cloudfront create-invalidation --distribution-id \"\$CF_DISTRIBUTION\" --paths '/*'"
if [[ "$DRY_RUN" != 'false' ]]; then
    echo 'AWS CLI dry run support is inconsistent and this command does not have it, printing CDN refresh command with no dry run.'
    echo "$ $AWS_CDN_REFRESH"
else
    echo "$ $AWS_CDN_REFRESH"
    export INVALIDATION_ID="$(eval "$AWS_CDN_REFRESH" | tee >(cat - >&9) | jq -r '.Invalidation.Id')"
    echo 'Waiting for CDN edge nodes to refresh...'
    ee "aws cloudfront wait invalidation-completed --distribution-id \"\$CF_DISTRIBUTION\" --id '$INVALIDATION_ID'"
    echo "::notice title=Deployed v$(cat package.json | jq -r .version) to Production Worldwide::Frontend v$(cat package.json | jq -r .version) has been successfully uploaded and the content delivery network has been refreshed worldwide. This is live in production."
fi
echo "Done. - ${BASH_SOURCE[0]}"
