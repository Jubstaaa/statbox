import type { Constants } from 'twisted'
import type { z } from 'zod'

import type { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'
import type { matchEntrySchema, riotDataSchema } from './riot.schemas'

// twisted exposes its region enums only as values on Constants, so the types
// are derived from them rather than imported from a dist path.
export type TwistedRegion =
    (typeof Constants.Regions)[keyof typeof Constants.Regions]
export type TwistedRegionGroup =
    (typeof Constants.RegionGroups)[keyof typeof Constants.RegionGroups]

export type Region = (typeof REGIONS)[number]
export type RankedQueue = (typeof RANKED_QUEUES)[number]
export type WidgetStyle = (typeof WIDGET_STYLES)[number]

export type MatchEntry = z.infer<typeof matchEntrySchema>
export type RiotData = z.infer<typeof riotDataSchema>
