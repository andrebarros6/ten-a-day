# Ten a Day: spec

What the product is and is not. Derived from `BRIEF.md` without rewording; the brief stays in the repo as the original handoff. Scope, behaviour rules and acceptance checks are in `prd.md`.

## Decisions 2026-10-11

These were agreed with the owner after the brief was written. Where they differ from the sections below, they win.

- **No backend.** No Supabase and no accounts. Ticks and times are stored in `localStorage` only.
- **Open source.** The code is public on GitHub under the MIT licence so anyone can run their own copy.
- **Static export.** The app builds to plain files that any static host can serve.
- **Privacy by construction.** Nothing a user enters leaves their device. There is no analytics.

## Decisions 2026-10-21

- **Name and domain: Uberman, at `uberman.barrosbuilds.com`.** This is a deliberate exception to content rule 3. The owner chose the pun ("über", German for "over" or "super", close to "Huberman") knowing it sounds like the name and carries trademark risk. The product is "Uberman", with "Ten a Day: ten protocols a day to become über." as its tagline. The header and About page still say it is unofficial, and Huberman's and Bartlett's actual names stay out of the product name, logo and titles. If a rights holder objects, go back to "Ten a Day" at a neutral subdomain such as `tenaday.barrosbuilds.com`. Storage keys stay `tenaday.*` so saved data survives.
- **Host: Vercel**, serving the static export.

## Product

- **User:** someone who heard the episode and wants to actually do the ten things, daily, without re-listening to two hours of audio.
- **Core loop:** open the app, see today's ten in time order with clock times worked out from your own wake and bed times, tick them off, see the score and streak, share the result.
- **Second job:** show what the evidence really says for each protocol, including where it is thin or where the episode overstates a study. This honesty is a feature and must survive the rebuild.
- **Growth rule (standing requirement from the owner):** every product needs a strong reason for users to bring other users. Word of mouth is the main channel. See Sharing and referral.

## Content rules

These are not style preferences. Breaking them creates legal or trust problems.

1. **`content.json` is the source of truth.** Components render it. Do not paraphrase it again in code.
2. **All text is an original summary.** Never paste transcript text or book text into the app.
3. **The app is unofficial.** Say so in the header and on the About page. Do not use Huberman's or Bartlett's name in the product name, domain, logo or page titles, and do not use their photos. Naming them in descriptive copy ("the ten protocols Andrew Huberman set out on...") is fine.
4. **Keep every evidence rating, every `note` and every `caution`.** Several findings deliberately correct the episode (the red-light figure, Lovaza, the meditation and sleep claim, the squat study). Do not smooth these away.
5. **Supplements are reported, not recommended.** Keep the wording that this records what was said. Keep the vitamin D upper-limit warning and the alpha-GPC stroke finding visible, not collapsed.
6. **Not medical advice.** The disclaimer on the About page stays, and a short version should sit in the footer of every page.
7. **Left out on purpose:** peptides, GLP-1 microdosing, psychedelics. Do not add them.
8. Never stare-at-the-sun and cold-water cautions stay attached to their protocols.

## Design

Keep the prototype's look. The essentials:

- **One narrow column** (max about 780px), a sticky tab strip that scrolls sideways on phones, no card grid.
- **The light rail:** the Today list hangs on a thin vertical bar whose colour runs from dawn orange through midday blue and dusk rose to night indigo. It encodes time of day; keep it as one continuous element, not a per-row accent.
- **Evidence pips:** three small squares, filled to show Strong (3), Moderate (2) or Early (1), always with the word beside them.
- Section labels are small uppercase monospace; times and doses are monospace with tabular figures.

Tokens (light / dark):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F1F4F7` | `#0D151E` | page |
| `--surface` | `#FFFFFF` | `#15202B` | inputs, tool boxes |
| `--ink` | `#15212C` | `#E7EDF2` | text |
| `--muted` | `#52616E` | `#9BAAB7` | secondary text |
| `--line` | `#D3DBE2` | `#2A3947` | hairlines |
| `--accent` | `#B8460E` | `#FF9B52` | links, active tab, cortisol curve |
| `--accent-soft` | `#FBE7DA` | `#3A2415` | "Now" chip, notes |
| `--done` | `#1B7A66` | `#53C7A9` | ticked, kept days |
| `--mel` | `#3F47B5` | `#A3ABFF` | melatonin curve |
| `--sleep` | `#E2E6F3` | `#1A2140` | sleep shading |
| `--dawn` `--noon` `--dusk` | `#F0A24F` `#86C3E8` `#D4728A` | same | rail |
| `--night` | `#2A2E6E` | `#4A50B0` | rail |

Fonts (Google Fonts): **Bricolage Grotesque** 500/700 for headings and numbers, **IBM Plex Sans** 400/500/600 for body, **IBM Plex Mono** 400/500 for labels and figures.

Dark mode follows the system setting by default, with an explicit override.
