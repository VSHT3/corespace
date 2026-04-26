## Design System

Theme: Brutalist Pastel

Colors:
- Background: #fef9f0 (warm cream)
- Foreground/text: #1a1a1a
- Borders: 2px solid #1a1a1a (all interactive elements, cards, inputs)
- Accent fills (for tags, highlights, callouts):
  - Yellow: #fde68a
  - Pink: #fbcfe8
  - Mint: #bbf7d0
  - Sky: #bae6fd
- Buttons: #1a1a1a bg, #fef9f0 text

Typography:
- All text: system font stack or Geist (no Inter, no Roboto)
- Headings: font-weight 700, letter-spacing -0.03em, tight line-height ~1.1
- Labels/eyebrows: font-weight 700, text-transform uppercase, letter-spacing 0.08em, font-size 11px, color #888
- Body: font-weight 400-500, font-size 14px, line-height 1.6

Borders & Radius:
- Border radius: 4px everywhere (cards, buttons, inputs, tags). No soft rounding.
- All cards and interactive elements: 2px solid #1a1a1a border
- Section dividers: 2px solid #1a1a1a border-bottom

Buttons:
- Primary: bg #1a1a1a, color #fef9f0, border 2px solid #1a1a1a, border-radius 4px, padding 8px 16px, font-size 12px, font-weight 700, text-transform uppercase, letter-spacing 0.06em
- No hover gradients — just bg swap to #333

Tags/badges:
- Border: 2px solid #1a1a1a, border-radius 4px
- Fill: one of the pastel accents depending on meaning (yellow = warning/prompt, pink = personal, mint = positive, sky = info)
- Text: font-weight 700, uppercase, font-size 11px, color #1a1a1a

Inputs:
- Border: 2px solid #1a1a1a, border-radius 4px
- Background: white or #fef9f0
- Focus: border-color stays, add outline: 2px solid #1a1a1a with 2px offset

No shadows. No gradients. No blur effects. No rounded pill shapes.
