# REX Staking Portal CI
This GitHub Actions workflow lints, tests, builds, and publishes the `rex-staking-portal` Svelte website.

### Index
1. [Triggers](#triggers)
1. [Inputs](#inputs)
1. [Steps](#steps)
1. [Outputs](#outputs)
1. [See Also](#see-also)

## Triggers
This GitHub action will run under the following circumstances:
1. When code is pushed to any branch.
1. When any tag is pushed.
1. On any workflow dispatch event, which is triggered manually using the "Workflow Dispatch" button in the Actions tab of the GitHub repository.

## Inputs
There are no inputs to this workflow beyond the contents of the `package.json` and the GitHub Actions [intrinsic environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

## Steps
This workflow performs the following steps:
1. Attach Documentation:
    1. Checkout the repo with no submodules or history.
    1. Attach an annotation to the GitHub Actions build summary page containing this CI documentation.
1. Build `rex-staking-portal`:
    > This is a build matrix with one or more nodeJS versions.
    1. Checkout this repo without history.
    1. Setup nodeJS at the given major version.
    1. Download project dependencies.
    1. Lint the project.
    1. Generate static site files and pack them in a `*.tar.gz` archive along with project and build metadata.
    1. Attach the `*.tar.gz` file as an artifact.
1. Publish `rex-staking-portal`:
    1. Checkout this repo without history.
    1. Determine whether to perform a deployment or a dry-run, and authenticate to Amazon Web Services (AWS) accordingly.
    1. Download build artifacts from the build matrix above.
    1. Push (or simulate pushing) the build artifacts to the AWS S3 bucket for the REX Staking Portal.

## Outputs
This workflow produces the following outputs:
1. Archive for upload to AWS S3 (`*.tar.gz`).

## See Also
- [Pipeline](https://github.com/eosnetworkfoundation/rex-staking-portal/actions/workflows/ci.yml)
- [Project Documentation](../../README.md)

For assistance with the CI system, please open an issue in this repo or reach out to the ENF Automation team.

---
> **_Legal Notice_**  
> This repo contains assets created in collaboration with a large language model, machine learning algorithm, or weak artificial intelligence (AI). This notice is required in some countries.
