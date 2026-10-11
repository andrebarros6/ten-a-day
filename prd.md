# Ten a Day: PRD

Scope, behaviour rules and acceptance checks. Derived from `BRIEF.md` without rewording; the brief stays in the repo as the original handoff. What the product is and is not is in `spec.md`.

## Decisions 2026-10-11

These were agreed with the owner after the brief was written. Where they differ from the sections below, they win.

- **No backend.** No Supabase and no accounts. Ticks and times are stored in `localStorage` only.
- **Open source.** The code is public on GitHub under the MIT licence so anyone can run their own copy.
- **Static export.** The app builds to plain files that any static host can serve.
- **Deferred because they need a backend:** sign-in, sync across devices (Version 1 item 4), counting referrals (the "how many people joined through them" part of item 5), and pairing. The acceptance check "Ticks made signed-out appear after signing in, and on a second device" does not apply to this build.
- **Kept from item 5:** the share text ends with the app URL and `?ref=CODE`. The code is generated and stored locally, and an inbound code is stored locally, so attribution can be switched on later without changing links already shared.
- **Kept from Data:** the merge rule is implemented and tested. It merges changes made in another browser tab today and is ready for a backend later. The Supabase tables are a design for later, not part of this build.
- **Added:** `/privacy` and `/terms` pages, and a control to delete all data stored on the device.

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
