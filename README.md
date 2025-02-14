Dummy new comment
# vite-compare-bundle-size

This action compares two Vite compilation stats files and comments on the PR with a description of the difference.

## Usage

Install `vite-bundle-analyzer`:

```bash
npm install vite-bundle-analyzer --save-dev
```

or:

```bash
yarn add vite-bundle-analyzer --dev
```

In `vite.config.ts`, configure `vite-bundle-analyzer` to output JSON:

```ts
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  vite: {
    plugins: [
      analyzer({
        analyzerMode: 'json',
      }),
    ],
  },
});
```

> [!TIP]
> You could enable this plugin conditionally in GitHub Actions by checking for `process.env.ANALYZE` environment variable.

In your action configuration, build both the head and the branch (in any way you see fit) and pass paths to the stats.json files as inputs on this action:

```yml
name: Compare bundle size

on:
  pull_request:
    branches: [main]

jobs:
  build-head:
    name: Build head
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{github.event.pull_request.head.ref}}

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload stats.json
        uses: actions/upload-artifact@v4
        with:
          name: head-stats
          path: ./dist/stats.json

  build-base:
    name: Build base
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.base_ref }}

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload stats.json
        uses: actions/upload-artifact@v3
        with:
          name: base-stats
          path: ./dist/stats.json

  compare:
    name: Compare bundle size
    runs-on: ubuntu-latest
    needs: [build-base, build-head]
    permissions:
      pull-requests: write

    steps:
      - name: Download stats.json files
        uses: actions/download-artifact@v4

      - name: Compare bundle size
      - uses: wojtekmaj/vite-compare-bundle-size@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          current-stats-json-path: ./head-stats/stats.json
          base-stats-json-path: ./base-stats/stats.json
```

This action requires the `write` permission for the [`permissions.pull-requests` scope](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idpermissions).

## Options

| name                    | description                                                                                                         | required | type   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| current-stats-json-path | The path to the current stats.json file                                                                             | true     | string |
| base-stats-json-path    | The path to the base stats.json file                                                                                | true     | string |
| github-token            | The GitHub token to use for authentication                                                                          | true     | string |
| title                   | An optional addition to the title, which also helps key comments, useful if running more than 1 copy of this action | false    | string |
| describe-assets         | Option for asset description output. One of "all" (default), "changed-only", or "none".                             | false    | string |

## License

The MIT License.

## Author

<table>
  <tr>
    <td >
      <img src="https://avatars.githubusercontent.com/u/5426427?v=4&s=128" width="64" height="64" alt="Wojciech Maj">
    </td>
    <td>
      <a href="https://github.com/wojtekmaj">Wojciech Maj</a>
    </td>
  </tr>
</table>
