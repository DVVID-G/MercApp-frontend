# Manual Testing Guide

**Feature**: 006-color-palette  
**Tasks**: T061, T062, T063, T065, T066, T067

## Overview

This guide provides step-by-step instructions for manual testing tasks that cannot be fully automated. These tests should be performed before each release to ensure color palette implementation meets all requirements.

---

## T061: Manual Review of Critical Cases

### Purpose
Manually review critical UI elements to ensure contrast compliance and visual consistency.

### Checklist

#### Buttons
- [ ] **Primary buttons** (Primary Mint background):
  - Verify white text is readable
  - Check font size is at least 18px (large text requirement)
  - Verify font weight is semibold (600+) or bold
  - Test hover state (90% opacity)
  - Test focus state (ring 2px, 50% opacity)
  - Test disabled state (50% opacity, cursor-not-allowed)

- [ ] **Secondary buttons** (Accent Orange background):
  - Verify white text is readable
  - Check font size is at least 18px
  - Verify font weight is semibold (600+) or bold
  - Test all interactive states

- [ ] **Destructive buttons** (Alert Coral background):
  - Verify white text is readable
  - Check font size is at least 18px
  - Verify font weight is semibold (600+) or bold
  - Test all interactive states

#### Text Elements
- [ ] **Headings** (h1, h2, h3, h4):
  - Verify Secondary Slate (#2D3E50) on Background Smoke (#F4F7F6)
  - Verify Secondary Slate on White (#FFFFFF)
  - Check readability in all contexts

- [ ] **Body text**:
  - Verify Secondary Slate on Background Smoke
  - Verify Secondary Slate on White
  - Check readability in all contexts

#### Alerts
- [ ] **Warning alerts** (Accent Orange):
  - Verify text is readable on Accent Orange/10 background
  - Check border visibility (Accent Orange/30)
  - Verify icon color (Accent Orange)

- [ ] **Critical alerts** (Alert Coral):
  - Verify text is readable on Alert Coral/10 background
  - Check border visibility (Alert Coral/30)
  - Verify icon color (Alert Coral)

### Tools
- Browser DevTools (Inspect element, check computed styles)
- Color contrast checker: https://webaim.org/resources/contrastchecker/

### When to Run
- Before each release
- After major color changes
- When adding new components with colors

---

## T062: Validate with axe-core in Browser

### Purpose
Use axe-core browser extension or DevTools to verify contrast in actual components.

### Steps

1. **Install axe DevTools Extension**:
   - Chrome: https://chrome.google.com/webstore/detail/axe-devtools
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/

2. **Open Application**:
   - Start dev server: `npm run dev`
   - Navigate to all major pages:
     - Login
     - Dashboard
     - Create Purchase
     - Purchase History
     - Profile

3. **Run axe-core Scan**:
   - Open DevTools (F12)
   - Go to "axe DevTools" tab
   - Click "Scan" button
   - Review all contrast violations

4. **Verify Specific Elements**:
   - Primary buttons
   - Secondary buttons
   - Destructive buttons
   - Headings
   - Body text
   - Alerts
   - Input fields

5. **Document Issues**:
   - Note any violations
   - Take screenshots if needed
   - Create issues for fixes

### Expected Results
- No contrast violations for text elements
- Buttons may show warnings if font size < 18px (expected, as we use large text)
- All violations should be addressed before release

### When to Run
- During development (before committing)
- Before each release
- After color changes

---

## T063: Test with Color Blindness Simulators

### Purpose
Verify colors are distinguishable for users with color blindness.

### Steps

1. **Install Browser Extension**:
   - Chrome: "Colorblind - Web Page Filter" or "NoCoffee"
   - Firefox: "Colorblind Web Page Filter"

2. **Test Color Combinations**:
   - **Primary Mint vs Accent Orange**: Verify distinguishable
   - **Accent Orange vs Alert Coral**: Verify distinguishable
   - **Secondary Slate on Background Smoke**: Verify readable
   - **White on Primary Mint**: Verify readable
   - **White on Accent Orange**: Verify readable
   - **White on Alert Coral**: Verify readable

3. **Test Different Types**:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
   - Achromatopsia (complete color blindness)

4. **Verify UI Elements**:
   - Buttons are distinguishable
   - Alerts are distinguishable
   - Status indicators are clear
   - Charts are readable

### Online Tools
- https://www.toptal.com/designers/colorfilter
- https://www.color-blindness.com/coblis-color-blindness-simulator/

### When to Run
- Before each release
- When adding new color combinations
- When designing new UI elements

---

## T065: Visual Regression Testing

### Purpose
Take screenshots before/after to ensure no unintended visual changes.

### Steps

1. **Setup**:
   - Use browser DevTools or screenshot tool
   - Set viewport to standard sizes (320px, 768px, 1024px)

2. **Take Screenshots**:
   - **Before**: Screenshots of all pages before color changes
   - **After**: Screenshots of all pages after color changes

3. **Pages to Screenshot**:
   - Login page
   - Dashboard
   - Create Purchase
   - Purchase History
   - Profile
   - Product Catalog

4. **Compare**:
   - Use visual diff tool (if available)
   - Manually compare screenshots
   - Verify only intended changes

5. **Document**:
   - Note any unintended changes
   - Verify layout is not broken
   - Verify spacing is maintained

### Tools
- Browser DevTools (Screenshot feature)
- Visual regression tools (Percy, Chromatic, etc.)
- Manual comparison

### When to Run
- After major color changes
- Before each release
- When updating component styles

---

## T066: Test on Mobile Viewports

### Purpose
Verify colors are readable and accessible on all screen sizes.

### Steps

1. **Open Browser DevTools**:
   - Press F12
   - Click device toolbar icon (or Ctrl+Shift+M)

2. **Test Viewports**:
   - **320px** (smallest mobile):
     - Verify text is readable
     - Verify buttons are accessible
     - Verify colors maintain contrast
   
   - **390px** (standard mobile):
     - Verify text is readable
     - Verify buttons are accessible
     - Verify colors maintain contrast
   
   - **768px** (tablet):
     - Verify text is readable
     - Verify buttons are accessible
     - Verify colors maintain contrast

3. **Test Elements**:
   - Buttons (all variants)
   - Headings (all levels)
   - Body text
   - Alerts
   - Input fields
   - Cards

4. **Verify**:
   - Colors are consistent across viewports
   - Contrast ratios are maintained
   - Text is readable
   - Interactive elements are accessible

### When to Run
- Before each release
- When adding responsive styles
- When testing on new devices

---

## T067: Test in Different Lighting Conditions

### Purpose
Verify colors are readable in bright sunlight and low light conditions.

### Steps

1. **Bright Sunlight Simulation**:
   - Increase screen brightness to maximum
   - Test in well-lit room
   - Verify:
     - Text is readable
     - Buttons are visible
     - Colors maintain contrast
     - No glare issues

2. **Low Light Simulation**:
   - Decrease screen brightness to minimum
   - Test in dark room
   - Verify:
     - Text is readable
     - Buttons are visible
     - Colors maintain contrast
     - No eye strain

3. **Test Elements**:
   - All text elements
   - All buttons
   - All alerts
   - All interactive elements

### When to Run
- Before each release
- When testing on actual devices
- When users report visibility issues

---

## Summary Checklist

Before each release, complete:

- [ ] T061: Manual review of critical cases
- [ ] T062: Validate with axe-core in browser
- [ ] T063: Test with color blindness simulators
- [ ] T065: Visual regression testing
- [ ] T066: Test on mobile viewports
- [ ] T067: Test in different lighting conditions

All tests should pass before releasing to production.


