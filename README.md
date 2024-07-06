# Rex Staking Portal
This is a staking UI for EOS REX built in SvelteKit.

It simplifies the process of staking, un-staking, and claiming rewards post-tokenomics-2 upgrade.

You can see it live at [https://stake.eosnetwork.com](https://stake.eosnetwork.com).

<!-- contents box begin -->
<table>
<tr/>
<tr>
<td>
<p/>
<div align="center">
<b>Contents</b>
</div>
<p/>
<!-- contents markdown begin -->

1. [Development](#development)
    1. [Prerequisites](#prerequisites)
    1. [Initialization](#initialization)
1. [See Also](#see-also)

<!-- contents markdown end -->
<p/>
</td>
</tr>
</table>
<!-- contents box end -->

## Development
Start here to build this project or to contribute to this repo.

> [!NOTE]
> The source of truth for the version of nodeJS this project supports is the [`.nvmrc`](./.nvmrc) file. Backward- or forward-compatibility with other versions of `node` is made on a best-effort basis, but is not guaranteed.

### Prerequisites
You will need the following tools:
- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [nodeJS](https://www.w3schools.com/nodejs/nodejs_intro.asp)  
    Install `node` using `nvm`. In the root of this repo:
    ```bash
    nvm install
    ```
    This will automagically install and use the correct version of `node` for this project, as defined in the [`.nvmrc`](./.nvmrc) file.
- [yarn](https://yarnpkg.com) version 1  
    The easiest way to install this is using `npm`, which is installed with `node` by `nvm`.
    ```bash
    npm install --global yarn
    ```
These tools are all you need to get started!

### Initialization
Once you have the [prerequisites](#prerequisites) installed, you can get going by making sure `nvm` is using the correct version of nodeJS...
```bash
nvm install
```
...and then downloading all project dependencies.
```bash
yarn
```
Easy.

## See Also
More resources.
- [aws-cloudwatch-alarm-handler](https://github.com/eosnetworkfoundation/aws-cloudwatch-alarm-handler) lambda
- [devhub](https://github.com/eosnetworkfoundation/devhub) - learn portal
- [telegram-bot](https://github.com/eosnetworkfoundation/telegram-bot) lambda

---
> **_Legal Notice_**  
> This repo contains assets created in collaboration with a large language model, machine learning algorithm, or weak artificial intelligence (AI). This notice is required in some countries.
