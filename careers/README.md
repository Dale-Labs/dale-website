# DALE Careers Scaffold

## Folder

The Careers workspace was created at `careers/`.

## Repository architecture found

- Framework / stack: static HTML, CSS, and small page-local JavaScript, deployed with Cloudflare Pages Functions.
- Routing: public routes are directories with `index.html`, for example `research/index.html`, `blog/index.html`, and `akfc/index.html`.
- Build: `scripts/build-cloudflare.js` copies all non-excluded top-level folders into `dist`; `careers/` is included without build-script changes.
- Page convention: public pages keep their CSS inline and use relative links for same-site navigation.
- Existing public design source: the main DALE pages use Marcellus headings, Nunito body text, dark DALE background, coral accents, muted teal text, thin borders, uppercase nav/eyebrow labels, simple card grids, and responsive one-column collapse.
- Related content found: `research/validation-environments/` mentions fellowship ecosystems as a validation environment. No existing public recruitment or careers section was found.

## Routes

- `/careers`
- `/careers/fellowships`
- `/careers/volunteers`
- `/careers/experteers`
- `/careers/fellowships/jielekeze`
- `/careers/fellowships/shared-value-exchange`
- `/careers/fellowships/akfc`
- `/careers/fellowships/ammi`
- `/careers/fellowships/innovation`

Each route follows the repository's existing static route convention: a folder with an `index.html` file.

## Files added

- `careers/index.html`
- `careers/fellowships/index.html`
- `careers/volunteers/index.html`
- `careers/experteers/index.html`
- `careers/README.md`
- `careers/fellowships/shared/pathway-pages.css`
- `careers/fellowships/shared/pathway-pages.js`
- `careers/fellowships/jielekeze/index.html`
- `careers/fellowships/shared-value-exchange/index.html`
- `careers/fellowships/akfc/index.html`
- `careers/fellowships/ammi/index.html`
- `careers/fellowships/innovation/index.html`

## Files changed

- `careers/index.html`
- `careers/fellowships/index.html`
- `careers/README.md`

## Shared DALE components and styles reused

The scaffold reuses the public DALE site patterns found in `index.html`, `research/index.html`, and `blog/index.html`:

- Marcellus headings and Nunito body typography.
- Dark DALE background, coral accent, teal/muted text, and border tokens.
- `dale(a)` wordmark treatment.
- Uppercase eyebrow/kicker labels.
- Static folder-per-route pages.
- Responsive grid collapsing to one column on mobile.
- DALE card/link pattern with bordered panels and uppercase link labels.
- Simple DALE public nav and footer patterns.

## Careers graphic system

The Careers parent page uses a white-led DALE Draft expression built from the approved Careers palette:

- `#DD6D37` orange
- `#33207A` purple
- `#333333` charcoal
- `#FFFFFF` white

White is the dominant environment. Orange and purple act as active forces inside linework, nodes, pathway marks, highlights, hover states, and the `DESIGN THE FUTURE` invitation. Charcoal carries the primary typography, borders, and structural diagram elements.

Code-generated graphic motif prototypes live in `careers/index.html` as modular `.graphic-slot` regions:

- `data-motif="branching-system"`: opening question graphic. This can later accept a transparent desktop asset around 5:4 and a mobile asset around 4:3.
- `data-motif="exploded-system"`: value-section recombination graphic. This can later accept a transparent or flat-background desktop asset around 16:7 and a mobile asset around 4:5.
- `data-motif="opening-pathways"`: Design the Future participation reveal. This can later accept a transparent desktop asset around 16:4 and a mobile asset around 4:3.

Future Canva assets should preserve transparent backgrounds wherever possible so the white drawing-board environment remains dominant. If an asset requires its own background, provide separate desktop and mobile exports so the page does not need to be restructured.

## Fellowship pathway page system

The individual Fellowship pages use shared static assets:

- `careers/fellowships/shared/pathway-pages.css`
- `careers/fellowships/shared/pathway-pages.js`

The four vertical pathway pages share a public architecture: research question, starting model, public translation, relation-by-relation hypothesis highlighting, validation questions, validation field, research focus, proficiency, shared Fellowship information, and page-level application hook.

The Innovation page uses the same visual language but does not use a fifth vertical equation. It shows four pathway outputs entering a lateral comparison field.

Equation and pathway graphics are code-generated prototypes. The functional structure remains HTML first, with buttons used only to highlight individual hypothesised relations. Without JavaScript, all relation explanations remain visible. With JavaScript, one relation is emphasised at a time.

Future Canva equation/pathway assets should be transparent and preserve these slots:

- Hero route map: desktop 5:4, mobile 4:3.
- Equation board: desktop wide transparent overlay, mobile stacked/vertical alternative.
- Innovation comparison field: desktop 5:4 or 4:3, mobile 4:5.

Level 1 Fellowship applications are hosted externally in the DALE Labs Google application environment.

- Approved Level 1 URL: `https://forms.gle/gvaDyRi4e5wuosVN7`
- All five Fellowship pathway pages currently enter the same Level 1 form.
- The website uses direct external links with `target="_blank"` and `rel="noopener noreferrer"`.
- Level 2-4 are not implemented in the website repository.
- Google Forms manages initial application intake outside this repository.

## Routing conventions followed

The repository does not use a JavaScript app router for public pages. Public routes are static directories containing `index.html`. The Cloudflare build script copies top-level static folders into `dist`, so `careers/` will be included without build-script changes.

## Assumptions

- Global navigation placement for Careers is a product decision. The scaffold includes Careers in the local Careers navigation only and does not add it to the homepage or global footer.
- The subpath pages are intentionally minimal entry points, not production programme pages.
- Fellowship-specific future work should stay under `careers/fellowships/`.
- Shared Careers components can be introduced under `careers/` when repeated production sections emerge; no new shared abstraction was created for this first static scaffold.

## Blockers or decisions needed

- Decide whether Careers should be exposed in the homepage primary navigation, homepage footer, both, or only through campaign/direct links.
- Decide whether the site should eventually extract shared DALE public styles into a common stylesheet before the Careers section grows.
