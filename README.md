# GitHub Data
Quickly populate mocks with real data from GitHub!

### Usage
To populate data from GitHub, layers need to describe what data they should render.

You can do this by naming your layers with the following syntax:

`__{fieldname}`, e.g. `__bio`, or `__avatar_url`

For nested values, use dot syntax:

`__owner.avatar_url`

For example field names, see the following examples:
- user: https://api.github.com/users/brianlovin
- org: https://api.github.com/orgs/github
- repo: https://api.github.com/repos/withspectrum/spectrum

### Running locally

1. Clone the repository: `git clone https://github.com/brianlovin/figma-github-data.git`
1. Go to the directory: `cd figma-github-data`
1. Install dependencies with `yarn`
1. Build the plugin: `yarn run build:watch`
1. Go to the `plugins` directory in Figma
1. Add a new development plugin
1. Select the `figma-github-data/manifest.json` file as the manifest