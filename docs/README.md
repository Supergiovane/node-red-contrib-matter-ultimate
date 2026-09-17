# Maintaining the documentation

The public site is Jekyll, built by GitHub's Pages action. Reader pages are in `en/`, `it/`, `de/`, `fr/`, `es/` and `zh-CN/`; each language has Start, Nodes and Examples. The language navbar keeps the current section.

## Enable publishing once

After this package has its own GitHub repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Commit/push the documentation and `.github/workflows/docs.yml` to `main` or `master`. The workflow builds and publishes on changes to docs or examples. Pull requests build without deploying. The expected URL is https://supergiovane.github.io/node-red-contrib-matter-ultimate/. Update `_config.yml` if the repository or owner changes.

These files prepare publication; they do not change repository settings by themselves.

## Preview

Install the GitHub Pages-compatible Jekyll toolchain, then run `npm run docs:serve` from the package directory. Or use `npm run docs:build` for a static build in `docs/_site`. No documentation dependencies are added to the Node-RED runtime.

`npm run docs:prepare` copies the canonical `examples/*.json` into the site for downloads. Do not edit `docs/examples`: it is generated and ignored by Git. Run this step again after changing an example.

Historical `docs/wiki` files are retained as source references but explicitly excluded from the new public site. The new site navigation does not link to them.

[GitHub Pages with Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll)


## README artwork

`assets/brand/logo-supervibe.png` reuses the creator mark from KNX Ultimate. `assets/brand/max-supervibe-youtube.png` was edited from KNX Ultimate's `img/readmemain.png` using the built-in imagegen tool. The source photograph is retained in the KNX Ultimate repository.

Final image-edit prompt:

```text
Use case: text-localization. Asset type: photographic README banner for Matter Ultimate. Input image is the edit target, the existing KNX Ultimate banner. Make a matching Matter Ultimate version. Preserve the man's photograph, face, identity, expression, glasses, skin texture, hair, body, crop and right-hand half EXACTLY. Preserve the navy background, composition and typography style; use soft rose/coral accents on the left instead of gold, matching Matter Ultimate's #EDA7A6 identity. Change only the text on the left: retain small 'MAX SUPERVIBE'; replace the large two-line 'KNX ULTIMATE' with 'MATTER' / 'ULTIMATE'; replace the description with the exact Italian text 'Dispositivi connessi e smart home' and on the next line '— spiegati con stile.'; replace the three bottom outlined labels with 'MATTER', 'SMART HOME', 'NODE-RED'. No new objects, no other words, no KNX wording remaining on the left. Keep the same landscape aspect ratio and high resolution. This is an edit of existing artwork, not a new portrait. Save as PNG.
```
