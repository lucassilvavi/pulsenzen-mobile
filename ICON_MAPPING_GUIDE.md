# Icon Mapping Documentation

## Overview
This document lists all the SF Symbol to Material Icon mappings in the PulseZen app. The mapping allows the app to use SF Symbols on iOS and Material Icons on Android/Web for consistent cross-platform appearance.

## Icon Mapping File
Location: `/components/ui/IconSymbol.tsx`

## Complete Icon Mapping List

### Navigation Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `house.fill` | `home` | Home navigation |
| `paperplane.fill` | `send` | Send actions |
| `chevron.left.forwardslash.chevron.right` | `code` | Code/development |
| `chevron.right` | `chevron-right` | Right navigation arrows |
| `chevron.left` | `chevron-left` | Left navigation arrows, back buttons |

### Action Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `addition` | `add` | Add/create actions |
| `plus` | `add` | Add/create actions |
| `checkmark.circle.fill` | `check-circle` | Completed states |
| `checkmark` | `check` | Simple checkmarks, streak indicators |
| `magnifyingglass` | `search` | Search functionality |
| `pencil` | `edit` | Edit actions, journal prompts |

### Status and Feedback Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `info.circle` | `info` | Information displays |
| `flame.fill` | `local-fire-department` | Streak counters |

### Communication Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `phone.fill` | `phone` | Emergency contacts, SOS module |

### Nature and Elements Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `wind` | `air` | Breathing exercises |
| `moon.stars.fill` | `nights-stay` | Sleep/relaxation sounds |
| `bolt.fill` | `flash-on` | Energy/power breathing techniques |

### Objects and Tools Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `book.fill` | `menu-book` | Journal/diary features |
| `heart.fill` | `favorite` | SOS/emergency, health features |
| `square` | `crop-square` | Box breathing technique |

### Body and Health Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `brain` | `psychology` | Mental health, breathing benefits |

### Breathing Module Specific Icons
| SF Symbol | Material Icon | Usage |
|-----------|---------------|--------|
| `lungs` | `favorite` | Deep breathing techniques |
| `arrow.left.and.right` | `swap-horiz` | Alternate nostril breathing |

## Usage Examples

### QuickAccess Component
```tsx
const quickAccessItems = [
  {
    title: 'Respiração',
    icon: 'wind',  // Maps to 'air'
    // ...
  },
  {
    title: 'Sons',
    icon: 'moon.stars.fill',  // Maps to 'nights-stay'
    // ...
  },
  {
    title: 'Diário',
    icon: 'book.fill',  // Maps to 'menu-book'
    // ...
  },
  {
    title: 'SOS',
    icon: 'heart.fill',  // Maps to 'favorite'
    // ...
  },
];
```

### Breathing Techniques
```tsx
export const BREATHING_TECHNIQUES = [
  {
    name: 'Respiração Simples',
    icon: { name: 'wind', color: '#2196F3', bg: '#E3F2FD' },
    // Maps to Material Icon 'air'
  },
  {
    name: 'Respiração Quadrada',
    icon: { name: 'square', color: '#4CAF50', bg: '#E8F5E9' },
    // Maps to Material Icon 'crop-square'
  },
  // ...
];
```

### Emergency Contact Card
```tsx
<IconSymbol name="phone.fill" size={24} color={getIconColor()} />
// Maps to Material Icon 'phone'
```

## Adding New Icons

### Step 1: Find SF Symbol
1. Open SF Symbols app on macOS
2. Find the desired symbol
3. Note the exact symbol name

### Step 2: Find Material Icon
1. Visit [Icons Directory](https://icons.expo.fyi)
2. Search for equivalent Material Icon
3. Note the exact icon name

### Step 3: Add Mapping
Add to the `MAPPING` object in `/components/ui/IconSymbol.tsx`:

```tsx
const MAPPING = {
  // ...existing mappings
  'your.sf.symbol': 'your-material-icon',
} as any;
```

### Step 4: Update Documentation
Add the new mapping to this documentation file.

## Best Practices

### Icon Selection
- Choose semantically similar icons between SF Symbols and Material Icons
- Prefer filled versions for better visibility at small sizes
- Consider the app's overall design language

### Naming Convention
- Use exact SF Symbol names (case-sensitive)
- Use exact Material Icon names (kebab-case)
- Group related icons in documentation

### Fallback Behavior
If a SF Symbol is not found in the mapping, the component will:
1. Try to use the SF Symbol name as Material Icon name
2. If that fails, display a placeholder or empty icon

## Platform Differences

### iOS
- Uses native SF Symbols
- Vector-based, scales perfectly
- Consistent with iOS design language

### Android/Web
- Uses Material Icons from Expo Vector Icons
- Mapped equivalents maintain similar meaning
- Consistent with Material Design language

## Icon Sources

### SF Symbols
- Apple's official icon library
- Available in SF Symbols app
- Documentation: [Apple SF Symbols](https://developer.apple.com/sf-symbols/)

### Material Icons
- Google's Material Design icons
- Available through Expo Vector Icons
- Browse at: [Icons Directory](https://icons.expo.fyi)

## Troubleshooting

### Icon Not Displaying
1. Check if the SF Symbol name is correct
2. Verify the Material Icon mapping exists
3. Ensure the Material Icon name is valid
4. Check console for any error messages

### Icon Looks Different on Platforms
1. Review the mapping for semantic similarity
2. Consider using different icons for better platform consistency
3. Test on both iOS and Android devices

### Performance Considerations
- Icons are lightweight and cached automatically
- No impact on app bundle size
- Icons load instantly without network requests
