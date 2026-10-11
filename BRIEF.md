# Ten a Day: build brief for Claude Code

A daily checklist app for the ten protocols Andrew Huberman set out on The Diary Of A CEO (episode released 3 September 2026), with the research behind each one. This brief hands a working single-file prototype over to be rebuilt as a real, public web app.

## Files in this handoff

| File | What it is | How to use it |
|---|---|---|
| `ten-a-day-prototype.html` | The working prototype. One self-contained HTML file, vanilla JS, no build step. Opens in any browser and saves to `localStorage`. | Reference for behaviour, layout, copy and visual design. Read it before writing code. Do not ship it as is. |
| `content.json` | Every protocol, supplement and study as structured data, exported from the prototype. | Source of truth for content. Import it; do not retype or reword content in components. |
| `BRIEF.md` | This file. | Spec and constraints. |

The prototype contains a block that syncs to a Claude artifact database (`window.claude.use(...)`, `initRemote`, `pushRemote`, `mergeRemote`). That is specific to where the prototype was hosted. Replace it with Supabase; keep the merge rule (see Data).

## Product

- **User:** someone who heard the episode and wants to actually do the ten things, daily, without re-listening to two hours of audio.
- **Core loop:** open the app, see today's ten in time order with clock times worked out from your own wake and bed times, tick them off, see the score and streak, share the result.
- **Second job:** show what the evidence really says for each protocol, including where it is thin or where the episode overstates a study. This honesty is a feature and must survive the rebuild.
- **Growth rule (standing requirement from the owner):** every product needs a strong reason for users to bring other users. Word of mouth is the main channel. See Sharing and referral.

## Stack

Use the owner's standard stack unless told otherwise:

- Next.js App Router, TypeScript
- Tailwind CSS and shadcn/ui, themed to the tokens below (do not ship default shadcn styling)
- Supabase for auth and Postgres
- Vercel for hosting

## Scope

### Version 1 (build this)

1. **Today** screen: wake and bed time inputs, rhythm chart, the ten rows in time order with tick boxes, score, last-7-days bars, share block.
2. **Protocol pages**, one per protocol, statically rendered at `/protocol/[slug]` so search engines and AI crawlers can read them: steps, bad-day minimum, why it works, evidence rating, studies with links, cautions, episode timestamp, "Mark done today" button.
3. **Supplements** page and **About** page, statically rendered.
4. **Works without an account.** Ticks and times save to `localStorage` first. Signing in (Supabase magic link or OAuth) syncs them and merges local data into the account.
5. **Share with a link.** The share text ends with the app URL carrying the user's referral code. Referral attribution is stored when a new user arrives through it.
6. **Light and dark themes**, phone-first, no horizontal scroll at 360px.
7. The two small tools: the breathing pacer (protocol 5) and the back-to-sleep eye sequence (protocol 8).

### Later (do not build yet, but do not block)

- Accountability partner: invite one person by link, each sees the other's daily score and streak.
- Shareable image card (Open Graph image per day or per streak milestone).
- Reminders at the computed times (web push or email).
- Portuguese and French versions. Keep all copy in `content.json` or a messages file so it can be translated.
- Weekly review and history beyond 7 days.

## Behaviour rules

Copy these exactly; they are implemented in the prototype's script and worth porting as pure, tested functions.

### Day boundary

A "day" rolls over at **04:00 local time**, not midnight, so ticking "Sleep dark" after midnight lands on the right day. Day key = local date of (now minus 4 hours), formatted `YYYY-MM-DD`.

### Time windows

Let `W` = wake time, `B` = bed time, `D` = waking day length (`B − W`, wrapped to 24 h). If `D` is under 8 h or over 21 h, treat it as 16 h.

| No. | Protocol | Window | Hint shown |
|---|---|---|---|
| 1 | Water on waking | `W` to `W + 30 min` | Within 30 minutes of waking |
| 2 | Morning light | `W` to `W + 60 min` | In your first hour |
| 3 | Train early | `W` to `W + 3 h` | In your first 3 hours |
| 4 | One hard focus block | `W + 2 h` to `W + 6 h` | One block, best after training |
| 5 | The physiological sigh | none ("Any time") | When stress spikes |
| 9 | Eat for steady energy, walk after meals | none ("At meals") | Walk 5–10 minutes after eating |
| 6 | Late-day light | `W + ⅔·D` (rounded to 5 min) to `B − 3 h`; if shorter than 60 min, make it 90 min | Last third of your day, before dark |
| 7 | Dim the evening | `B − 2 h` to `B` | Screens off by `B − 30 min` |
| 10 | Goal-free time | `B − 1 h` to `B` | Once a day. He does it before sleep |
| 8 | Sleep dark | `B` to next `W` | All night |

The Today list is shown in that order (1, 2, 3, 4, 5, 9, 6, 7, 10, 8), which is `meta.todayOrder` in `content.json`. A row shows a "Now" chip when the current time is inside its window and it is not yet ticked.

### Score and streak

- Score = number of protocols ticked today, out of 10.
- A day is **kept** at 7 or more (`meta.streakThreshold`).
- Streak = consecutive kept days ending today; if today is not yet kept, count from yesterday so an in-progress day never breaks the streak.
- Last-7-days bars: one bar per day, height = count ÷ 10, kept days in the "done" colour.

### Share text

```
Ten a Day · Sun, 11 Oct
7/10  ■■■□■■■□□■
Streak: 4 days
Water, light, training, focus, sigh, late light, dim evening, dark sleep, food + walk, quiet time.
What's yours?
<app URL with ?ref=CODE>
```

Squares are in protocol-number order (1 to 10), not Today order. Omit the streak line when the streak is 0. The prototype has no URL line because it had no public address; add it.

### Rhythm chart

A schematic of cortisol (solid) and melatonin (dashed) across 24 hours from wake to next wake, with the sleep period shaded and a "now" line. It is an illustration of the idea behind the ten, not user data, and the caption must say so. Port `drawRhythm()` from the prototype; the curve functions are there.

### Breathing pacer

Three rounds of: inhale 2 s, second short inhale 1 s, exhale 6 s. A circle scales with each phase; the phase label is announced to screen readers. With `prefers-reduced-motion`, drop the animation and keep the text.

## Data

Suggested Supabase tables. Enable row-level security so users read and write only their own rows.

```sql
profiles (
  id uuid primary key references auth.users,
  wake_time time not null default '07:00',
  bed_time  time not null default '23:00',
  settings_updated_at timestamptz,
  referral_code text unique not null,
  referred_by uuid references profiles(id),
  created_at timestamptz default now()
)

day_logs (
  user_id uuid references profiles(id) on delete cascade,
  day date not null,                 -- the 04:00-boundary day key
  mask smallint not null default 0,  -- bit (n-1) set = protocol n done
  updated_at timestamptz not null,
  primary key (user_id, day)
)
```

**Merge rule when local and account data meet** (first sign-in, or a second device): per day, the entry with the newer `updated_at` wins; for wake and bed times, the newer `settings_updated_at` wins. After merging, write back whatever the local side had that was newer. This is what `mergeRemote()` does in the prototype.

Local storage shape used by the prototype (key `tenaday.v1`), for migration:

```json
{ "wake": "07:00", "bed": "23:00", "st": 1760000000000,
  "days": { "2026-10-11": { "m": 3, "t": 1760000000000 } } }
```

## Sharing and referral

Version 1:

- Each profile gets a short `referral_code`. Anonymous users get one stored locally and attached to their profile on sign-up.
- The share text carries `?ref=CODE`. On landing, store the code in a cookie or local storage; on sign-up, set `referred_by`.
- Show the user how many people joined through them.

Design the next step now even if it ships later: **pairing**. The most natural reason to invite someone to a habit app is to do it together, so an invite link that pairs two people and shows each the other's daily score is the mechanic to build toward.

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

## Open items

Decide or fix these during the build; none blocks starting.

- **Protocol 9's number is inferred.** He says nutrition is one of the ten but never gives its number. The `note` on protocol 9 says so. Leave it unless a better source appears.
- **Study figures need checking.** Of 49 study entries, the existence of five papers was confirmed by search (Windred 2024, Powner & Jeffery 2024, Hamilton 2022, Balban 2023, Gao 2024), and the details quoted for Gao 2024 and Keating 2026 were checked against secondary write-ups. Every other citation and figure was written from recall and must be verified against the paper before public launch. A good task for a separate pass: open each `searchUrl`, confirm authors, year, journal and the number quoted in `finding`, and replace `searchUrl` with the DOI link.
- **Name and domain.** "Ten a Day" is a working name. Check availability and conflicts.
- **Privacy.** The owner is in the EU. Habit logs are personal and health-adjacent: collect the minimum, add account deletion and a plain privacy page, and do not send logs to analytics.
- **Time zones.** The prototype uses the device's local time. Store the day key computed on the client; do not recompute it on the server in UTC.

## Acceptance checks

- With wake 07:00 and bed 23:00, the windows read: 07:00–07:30, 07:00–08:00, 07:00–10:00, 09:00–13:00, 17:40–20:00, 21:00–23:00 (screens off by 22:30), 22:00–23:00, 23:00–07:00.
- Ticking a box at 01:30 records it against the previous calendar date.
- Six ticks does not count toward the streak; seven does. An unfinished today does not reset yesterday's streak.
- Ticks made signed-out appear after signing in, and on a second device.
- Every protocol page renders its full content with JavaScript disabled.
- No horizontal scroll at 360px; all text readable in both themes.
- Share text matches the format above and includes the referral link.
- Unit tests cover the window, day-key, streak and merge functions.

## Suggested first prompt

> Read `BRIEF.md`, `content.json` and `ten-a-day-prototype.html` in full. Then scaffold a Next.js App Router project (TypeScript, Tailwind, shadcn/ui) that reproduces the prototype's Today screen, protocol pages, Supplements and About from `content.json`, with local-storage persistence only. Port the time-window, day-key, streak and share-text logic as pure functions with unit tests first. Match the prototype's design tokens and fonts. Stop before adding Supabase and show me the result.
