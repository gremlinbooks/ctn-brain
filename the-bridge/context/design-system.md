# The Bridge — Design System

**Version:** 1.0
**Last Updated:** 2026-05-19

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| bg | #f4f3ef | Page background (warm parchment) |
| surface | #fefefe | Cards, panels |
| surface2 | #f8f7f3 | Hover states, nested surfaces |
| border | #e8e7e2 | Primary borders |
| border2 | #f0efe9 | Subtle dividers |
| text1 | #27261f | Primary text |
| text2 | #7a7970 | Secondary text |
| text3 | #b0afa8 | Muted text, labels |
| sage | #6b8f72 | Primary accent — FX, health, success |
| sageLight | #e8f0e9 | Sage background |
| amber | #9a7d52 | Oakbridge, financial, warnings |
| amberLight | #f2ece1 | Amber background |
| slate | #5a7089 | Polymarket, communications |
| slateLight | #e4eaf0 | Slate background |
| rose | #8f6b6b | 75 Hard, alerts |
| roseLight | #f0e8e8 | Rose background |
| plum | #9a7ab0 | Peptides, Claude usage |

## Typography

| Role | Font | Weights |
|------|------|---------|
| Display / Wordmark / Numbers | Cormorant Garamond | 300, 400, 500 |
| Data / Labels / Values / Times | IBM Plex Mono | 300, 400, 500 |
| Body / Navigation / Prose | DM Sans | 300, 400, 500, italic 300 |

Font URL: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap`

## Component Patterns

- **Panel:** White card (#fefefe), 12px border-radius, 1px border (#e8e7e2), colored top border (3px accent)
- **Tag:** 9px mono, uppercase, 0.08em letter-spacing, pill shape (border-radius: 20px), colored text + 10% opacity background
- **ProgressBar:** 3px height, rounded, accent color fill on #e8e7e2 track
- **Stat:** Mono label (9px, uppercase, text3) + Mono value (20px, text1) + optional subtitle
- **Dot:** 6px circle, colored, inline-flex

## Layout

- **Navigation:** 6 tabs (Overview · Bots · Communications · Lifestyle · Revenue · Budget)
- **Top bar:** Logo + clocks + bot status dots + daily P&L
- **Overview:** 3-column (Left: Must Do's + Mail + Calendar | Center: Canvas + AI Terminal | Right: Gratitude + Financial + Tasks + Health)
- **Canvas:** Default shows logo watermark. Click any right-panel section header to expand into center.

## Logo

Heraldic shield crest in deep charcoal (#1a1814) with aged gold (#c4a35a). Bridge illustration with stone towers, arch, sage river below. Mottos: ENDURE · RISE · CREATE / VICTORY OR DEATH / *aut vincere aut mori*. Celtic triquetra at base.

Logo appears as watermark at ~7% opacity in center canvas default state.