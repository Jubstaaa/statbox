import type { Constants } from 'twisted'
import type { z } from 'zod'

import type { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'
import type { matchEntrySchema, riotDataSchema } from './riot.schemas'

export type MatchEntry = z.infer<typeof matchEntrySchema>
export type RankedQueue = (typeof RANKED_QUEUES)[number]

export type Region = (typeof REGIONS)[number]
export type RiotData = z.infer<typeof riotDataSchema>
export type TwistedRegion =
    (typeof Constants.Regions)[keyof typeof Constants.Regions]

export type TwistedRegionGroup =
    (typeof Constants.RegionGroups)[keyof typeof Constants.RegionGroups]
export type WidgetStyle = (typeof WIDGET_STYLES)[number]
