# MANOS — tu mano en KWENCH

Hats, not software. A paper hat says who is free to help right now.

MANOS was built for AI Build Night #002. It is a clickable, local-only
prototype: a coworking front desk can see who is free and call them over,
and the helper's paper hat is the real-world signal.

## The idea

At 1:55 p.m., a member's slides won't show in the workshop room. The
front-desk manager needs someone now, but doesn't want to interrupt the
whole space or chase people through group chats.

- **Hat on = free. Hat off = busy.** Anyone in the room can see it from
  across the space, with no device and no login.
- **The printed hat carries the signal.** It has a name, skill categories,
  and a Ko-fi QR code that is visible once folded.
- **The app only mirrors the hat.** A helper sets I'm free / I'm busy to
  match what they're wearing. If the app and the hat disagree, the manager
  checks in person.
- **The manager dispatches.** The Desk shows a list of helpers, online
  first. The manager clicks a person and calls them over. Members never
  need a device.
- **Pricing is simple.** KWENCH pays the mano 10¢ per minute, capped at
  $2 per hand. The member pays nothing. An optional tip goes 100% to the
  mano through their Ko-fi.

## Pages

| Tab   | Who uses it     | What it does                                                   |
|-------|-----------------|----------------------------------------------------------------|
| Desk  | KWENCH manager  | List of helpers: online first, then offline. Click to call over. |
| Mano  | The helper      | I'm free / I'm busy, ping opt-in, rate, Ko-fi, complete a hand, tip QR. |
| Hat   | The helper      | Printable hat sheet with fold instructions.                    |

## Run it

Requires [mise](https://mise.jdx.dev) (Bun is pinned in `mise.toml`).

```bash
mise install
bun install
bun run dev        # local dev server
bun run build      # writes dist/index.html
open dist/index.html
```

`dist/index.html` is a single self-contained file. It works from disk with
no server.

## Stack

- Bun, React 19, Vite 7
- Tailwind CSS 4 with daisyUI 5 (`pastel` theme)
- `qrcode` for in-browser QR codes
- `vite-plugin-singlefile` for one static HTML build

## Demo notes

- Everything is local. State lives in `localStorage`. Use **Reset demo**
  in the footer to start over.
- Payments, pings, and call-overs are simulated. No money moves and no
  notifications are sent.
- The Ko-fi QR is real. Scanning it opens the Ko-fi URL configured for
  the mano.
- Public areas only. No private rooms, no stored payment data.

## Status

Prototype for a one-hour event. Not production software.
