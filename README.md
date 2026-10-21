# Uberman: Ten a Day

Ten protocols a day to become über. The name plays on über, German for "over" or "super".

A daily checklist for the ten protocols Andrew Huberman set out on The Diary Of A CEO (episode released 3 September 2026), with the research behind each one.

**Unofficial.** This project is not affiliated with Andrew Huberman, Steven Bartlett or their companies. All text is an original summary, not a transcript. It is general information for healthy adults and **not medical advice**.

## What it does

- Shows today's ten in time order, with clock times worked out from your own wake and bed times.
- Lets you tick them off, and shows your score, streak and last seven days.
- Gives each protocol its own page: steps, a bad-day minimum, why it works, an evidence rating, the studies and the cautions. Where the episode overstates a study, the page says so.
- Includes a breathing pacer and a back-to-sleep eye sequence.
- Builds a short text result you can paste to a friend.

## Your data

There is no server, no account and no analytics. Your times and ticks are kept in your browser's local storage and never leave your device. The Privacy page has a button that deletes them.

The trade-off is that nothing syncs between devices.

## Run it

Needs Node.js 22 or later.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Host your own copy

```bash
npm run build      # writes plain static files to out/
```

Upload `out/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages at a root domain, or your own server). No environment variables are required.

Optional, set at build time (see `.env.example`):

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_APP_URL` | The public address put at the end of the share text. Defaults to the address the page is opened from. |
| `NEXT_PUBLIC_REPO_URL` | The "Source" link. Defaults to this repository. |

## Checks

```bash
npm run lint
npm run typecheck
npm test           # unit tests for the time-window, day, streak, share and merge rules
npm run build && npm run e2e   # browser smoke tests against the static build
```

The first `npm run e2e` needs `npx playwright install chromium`.

## Where things are

| Path | What |
|---|---|
| `content.json` | Every protocol, supplement and study. The source of truth for content; components render it and never reword it. |
| `src/content/messages.en.json` | All other interface copy, kept in one file so it can be translated. |
| `src/lib/` | Pure, tested rules: time windows, the 04:00 day boundary, score and streak, share text, merge, storage. |
| `src/components/`, `src/app/` | The screens. |
| `spec.md`, `prd.md` | What the product is, its scope and its acceptance checks. |
| `BRIEF.md`, `ten-a-day-prototype.html` | The original handoff brief and single-file prototype, kept for reference. |

## Known gaps

- **Study figures are not all verified.** Of 49 study entries, the existence of five papers was confirmed by search, and the details quoted for two were checked against secondary write-ups. The rest were written from recall and still need checking against the papers. Each study link opens a search for the paper by title, not the paper itself. Corrections are welcome: open an issue or a pull request against `content.json`.
- **Protocol 9's number is inferred.** The episode says nutrition is one of the ten but never gives its number.
- No sync between devices, no counted referrals and no pairing. These need a backend, which this version leaves out on purpose. The storage and merge code is written so one can be added.

## Content rules for contributors

- Keep every evidence rating, `note` and `caution`. Several deliberately correct the episode.
- Supplements are reported, not recommended. Their warnings stay visible.
- Peptides, GLP-1 microdosing and psychedelics are left out on purpose.
- Do not paste transcript or book text. Do not use Huberman's or Bartlett's name in the product name, page titles or logo, and do not use their photos.

## Licence

[MIT](LICENSE)
