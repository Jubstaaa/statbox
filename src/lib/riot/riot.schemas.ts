import { z } from 'zod'

import { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'

export const regionSchema = z.enum(REGIONS)
export const rankedQueueSchema = z.enum(RANKED_QUEUES)
export const widgetStyleSchema = z.enum(WIDGET_STYLES)
