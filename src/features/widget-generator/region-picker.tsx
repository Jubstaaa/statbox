import { useId } from 'react'

import type { Region } from '@/lib/riot/riot.types'

import Chip from '@/features/widget-generator/chip'

import { BUILDER_REGIONS } from './widget-generator.constants'

interface RegionPickerProps {
    onSelect: (region: Region) => () => void
    value: Region
}

export default function RegionPicker({ onSelect, value }: RegionPickerProps) {
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
                        active={value === region}
                        className="flex-1 basis-[calc(25%-0.375rem)]"
                        key={region}
                        onClick={onSelect(region)}>
                        {region}
                    </Chip>
                ))}
            </div>
        </div>
    )
}
