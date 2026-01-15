# Title Screen Scaling Reference

## Image Details
- **File:** `public/sprites/suffer_sharp.jpg`
- **Original size:** 896 x 1152
- **Game canvas:** 800 x 600

## Scaling Solution

**Scale factor:** `0.52`

**Result:**
- Scaled size: 466 x 599 (fits in 800x600)
- Centered horizontally with 167px offset

## Sprite Setup

```typescript
k.add([
  k.sprite("sufferScreen"),
  k.pos(167, 0),  // Center horizontally
  k.scale(0.52),
]);
```

## Button Coordinates (Scaled)

| Button | x | y | width | height |
|--------|---|---|-------|--------|
| **Join** | 373 | 385 | 79 | 29 |
| **X** | 497 | 282 | 19 | 16 |

## Config.json Addition

```json
"titleScreen": {
  "imagePath": "/sprites/suffer_sharp.jpg",
  "scale": 0.52,
  "offsetX": 167,
  "buttons": {
    "join": { "x": 373, "y": 385, "width": 79, "height": 29 },
    "close": { "x": 497, "y": 282, "width": 19, "height": 16 }
  }
}
```

## Math Used

```
X coords: (originalX * 0.52) + 167
Y coords: (originalY * 0.52)
Width/Height: original * 0.52
```

### Original → Scaled

**Join button:**
- x: (397 * 0.52) + 167 = 373
- y: 740 * 0.52 = 385
- w: 151 * 0.52 = 79
- h: 55 * 0.52 = 29

**X button:**
- x: (635 * 0.52) + 167 = 497
- y: 543 * 0.52 = 282
- w: 36 * 0.52 = 19
- h: 31 * 0.52 = 16

## Troubleshooting

If buttons don't align:
1. Set button opacity to 0.3 temporarily to see placement
2. Adjust x/y in config.json
3. Test click detection
4. Set opacity back to 0 when correct
