import { SummonerRequestError } from './widget-generator.api'
import { BuilderStorageError } from './widget-generator.storage'

export function describeLookupError(error: unknown) {
    if (error instanceof BuilderStorageError) {
        return 'Your browser would not let StatBox save the account. Allow site data for statbox.live and try again.'
    }

    const status = error instanceof SummonerRequestError ? error.status : null

    switch (status) {
        case 400:
            return 'Check the name and tag: a Riot ID cannot contain those characters.'
        case 404:
            return 'Summoner not found. Check the name, tag, and region.'
        case 503:
            return 'Riot is busy right now. Try again in a minute.'
        default:
            return "Couldn't reach Riot right now. Try again shortly."
    }
}
