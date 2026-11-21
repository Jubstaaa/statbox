import { useSyncExternalStore } from 'react'

const subscribe = () => () => undefined
const getSnapshot = () => true
const getServerSnapshot = () => false

export function useHydrationReady(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
