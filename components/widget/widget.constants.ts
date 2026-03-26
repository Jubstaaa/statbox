import type { WidgetStyle } from '@/lib/riot/riot.types'

import type { WidgetStyleDefinition } from './widget.types'

export const POLL_INTERVAL = 30_000

export const TIER_COLORS: Record<string, string> = {
    BRONZE: '#c28b60',
    CHALLENGER: '#74b7ff',
    DIAMOND: '#7dd3fc',
    EMERALD: '#5ef2a2',
    GOLD: '#f4c95d',
    GRANDMASTER: '#ff7a8a',
    IRON: '#8fa6bf',
    MASTER: '#d6a0ff',
    PLATINUM: '#7ce0cb',
    SILVER: '#bfd1e0',
    UNRANKED: '#7a95b3',
}

export const WIDGET_STYLE_DEFINITIONS: Record<
    WidgetStyle,
    WidgetStyleDefinition
> = {
    classic: {
        description: 'Full vertical card for side placement.',
        height: '380px',
        label: 'Classic',
        style: 'classic',
        width: '300px',
    },
    compact: {
        description: 'Compact panel for corner placement.',
        height: '250px',
        label: 'Compact',
        style: 'compact',
        width: '260px',
    },
    minimal: {
        description: 'Slim horizontal strip for top or bottom overlays.',
        height: '72px',
        label: 'Minimal',
        style: 'minimal',
        width: '480px',
    },
    topbar: {
        description: 'Broadcast ribbon for top placement.',
        height: '40px',
        label: 'Topbar',
        style: 'topbar',
        width: '460px',
    },
}

export const WIDGET_STYLE_OPTIONS = Object.values(WIDGET_STYLE_DEFINITIONS)
