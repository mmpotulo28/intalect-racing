---
description: Refactor native UI/HTML tags into semantic HeroUI v3 equivalents.
---

Please refactor the provided UI components to strictly use HeroUI v3.

**Refactoring Guidelines:**

1. **Replace Native Elements**: Swap native HTML elements like `<button>`, `<a>`, `<input>`, and custom UI implementations with HeroUI v3 equivalents (`<Button>`, `<Link>`, `<Input>`, etc.).
2. **Use Compound Components**: Where applicable (e.g., Tabs, Accordions, Dropdowns, Cards), use HeroUI v3's compound component pattern via dot notation (e.g., `<Card><Card.Body>...`).
3. **Semantic Intent Over Visual Style**: Replace visual-based Tailwind/CSS definitions with HeroUI semantic variants: `primary`, `secondary`, `tertiary`, `danger`, `success`, `warning`.
4. **Predictable Sizing**: Standardize sizes using `sm`, `md`, `lg` rather than passing custom pixel-based or ad-hoc padding/margin strings to buttons and inputs.
5. **Styles**: Ensure `@heroui/react` is imported for components, and use `@heroui/styles` if CSS variants are needed dynamically.
6. **No V2 Props**: Remember that HeroUI v3 uses Tailwind v4 and React Aria. Do not use legacy v2 flat props if a compound pattern exists.

Please show the diff or the updated code block for the refactored code.
