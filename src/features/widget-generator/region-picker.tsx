import { useId } from 'react'

import Chip from '@/features/widget-generator/chip'
import type { Region } from '@/lib/riot/riot.types'

import { BUILDER_REGIONS } from './widget-generator.constants'

interface RegionPickerProps {
    value: Region
    onSelect: (region: Region) => () => void
}

export default function RegionPicker({ value, onSelect }: RegionPickerProps) {
    const labelId = useId()

    return (
        <div className="flex flex-col gap-2">
            <span
                className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase"
                id={labelId}>
                Region
            </span>
            <div
                aria-labelledby={labelId}
                className="flex flex-wrap gap-2"
                role="group">
                {BUILDER_REGIONS.map(region => (
                    <Chip
                        key={region}
                        active={value === region}
                        className="flex-1 basis-[calc(25%-0.375rem)]"
                        onClick={onSelect(region)}>
                        {region}
                    </Chip>
                ))}
            </div>
        </div>
    )
}
