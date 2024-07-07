# AWS CloudWatch Alarm Handler CI
This GitHub Actions workflow lints and tests the `aws-cloudwatch-alarm-handler` JavaScript project, then "builds" a `*.zip` file that can be uploaded directly to Amazon Web Services (AWS) [Lambda](https://aws.amazon.com/lambda).

### Index
1. [Triggers](#triggers)
1. [Inputs](#inputs)
1. [Steps](#steps)
1. [Outputs](#outputs)
1. [See Also](#see-also)

## Triggers
This GitHub action will run under the following circumstances:
1. When code is pushed to the `main` branch.
1. When code is pushed to any branch with a name starting with `release/`.
1. When any tag is pushed.
1. On any workflow dispatch event, which is triggered manually using the "Workflow Dispatch" button in the Actions tab of the GitHub repository.

## Inputs
There are no inputs to this workflow beyond the contents of the `package.json` and the GitHub Actions [intrinsic environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

## Steps
This workflow performs the following steps:
1. Attach Documentation:
    1. Checkout the repo with no submodules or history.
    1. Attach an annotation to the GitHub Actions build summary page containing this CI documentation.
1. Build `aws-cloudwatch-alarm-handler`:
    > This is a build matrix with one or more nodeJS versions.
    1. Checkout this repo with history.
    1. Setup nodeJS at the given major version.
    1. Download project dependencies.
    1. Lint the project.
    1. Run unit and integration tests.
    1. "Build" or, more accurately, pack a `*.zip` archive for upload to AWS.
    1. Attach the `*.zip` file as an artifact.

## Outputs
This workflow produces the following outputs:
1. Archive for upload to AWS Lambda (`*.zip`).

> 📁 Due to actions/upload-artifact [issue 39](https://github.com/actions/upload-artifact/issues/39) which has been open for over _three years and counting_, the archives attached as artifacts will be zipped by GitHub when you download them such that you get a `*.zip` containing the `aws-cloudwatch-alarm-handler-*.zip`. There is nothing anyone can do about this except for Microsoft/GitHub.

## See Also
- [Pipeline](https://github.com/eosnetworkfoundation/aws-cloudwatch-alarm-handler/actions/workflows/ci.yml)
- [Project Documentation](../../README.md)

For assistance with the CI system, please open an issue in this repo or reach out to the ENF Automation team.

---
> **_Legal Notice_**  
Some content in this repository was generated in collaboration with one or more machine learning algorithms or weak artificial intelligence (AI). This notice is required in some countries.
