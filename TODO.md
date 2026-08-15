# Task: Update Best Seller section to use BLACK.svg for products EXCEPT ROSY, PINKKY, and BOLDY

## Information Gathered
- Main file: `index.html` (3914 lines)
- Best Seller section uses `bsBottleImages` object with 3 entries:
  ```
  const bsBottleImages = {
    pinkky: 'images/pinky.svg',
    boldy:  'images/boldy.svg',
    rosy:   'images/rosy.svg',
  };
  ```
- `bsGetImg(p)` function looks up bottle images and falls back to generated SVG
- BLACK.svg exists in `images/BLACK.svg`
- Best Seller panels: drops (green), ladies (pink), gentlemen (cyan #05DBF2)

## Plan
1. **✅ Locate & modify `bsGetImg` function** in index.html:
   - Add check: if product name NOT rosy/pinkky/boldy (case-insensitive), return 'images/BLACK.svg'
   - Keep existing lookup for ROSY, PINKKY, BOLDY
2. **Update TODO.md** with progress tracking
3. **Test**: All non-special products in Best Seller show BLACK.svg bottle

## Dependent Files to be edited
- index.html (main change)

## Followup steps
1. Create/modify TODO.md
2. Edit index.html `bsGetImg` function  
3. Verify BLACK.svg renders correctly
4. Test with Firebase products
5. Run `open index.html` to preview


