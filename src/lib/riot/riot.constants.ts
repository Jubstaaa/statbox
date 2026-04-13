export const REGIONS = [
    'BR',
    'EUNE',
    'EUW',
    'JP',
    'KR',
    'LAN',
    'LAS',
    'ME',
    'NA',
    'OCE',
    'RU',
    'SG',
    'TR',
    'TW',
    'VN',
] as const

export const RANKED_QUEUES = ['solo', 'flex'] as const

export const QUEUE_ID_SOLO = 420
export const QUEUE_ID_FLEX = 440
export const MATCH_FETCH_COUNT = 20
export const RECENT_MATCHES_DISPLAY_COUNT = 5
export const REMAKE_DURATION_THRESHOLD_SECONDS = 300

export const RATE_LIMIT_MAX_REQUESTS = 20
export const RATE_LIMIT_WINDOW = '1 m' as const

export const WIDGET_STYLES = [
    'classic',
    'minimal',
    'compact',
    'topbar',
] as const
