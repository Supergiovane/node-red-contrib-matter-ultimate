# node-red-contrib-matter-ultimate — notes for Claude

## Documentation: its home is www.maxsupervibe.com

Since 2026-11-26 the documentation of this project lives on Massimo's website, https://www.maxsupervibe.com/docs/matter-ultimate/ (six languages), next to the help of all his other nodes (index: https://www.maxsupervibe.com/docs/). Manage it there:

- The text is written in this repo, in docs/<lang>/index.md, nodes.md and examples.md (menu words in docs/_data/labels.json). The website (repo SaccaniLiveStudioStack/SaccaniWebsite) copies it at every deploy with `scripts/sync-node-docs.mjs`; after a change, publish it with `npm run deploy` in SaccaniWebsite and check the page on the site.
- The old documentation on GitHub Pages (supergiovane.github.io/node-red-contrib-matter-ultimate/) only sends visitors to the website (docs/_layouts/default.html): do not add pages or design there.
- The README links to the site: keep documentation out of it and point to the site's pages.
- When linking to the documentation (README, node help, changelog, issues), use the www.maxsupervibe.com addresses, never supergiovane.github.io.
