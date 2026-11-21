import { SummonerRequestError } from './widget-generator.api'
import { BuilderStorageError } from './widget-generator.storage'

function statusOf(error: unknown) {
    return error instanceof SummonerRequestError ? error.status : null
}

export function describeLookupError(error: unknown) {
    if (error instanceof BuilderStorageError) {
        return 'Your browser would not let StatBox save the account. Allow site data for statbox.live and try again.'
    }

    switch (statusOf(error)) {
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

// The saved account was not typed just now: a busy or unreachable Riot is
// waited out, and only a missing or invalid account needs a new one.
export function describeSavedAccountError(error: unknown) {
    switch (statusOf(error)) {
        case 400:
            return {
                message:
                    'The saved account is no longer valid. Connect it again to continue.',
                needsNewAccount: true,
            }
        case 404:
            return {
                message:
                    'The saved account is no longer found in its region. Connect it again to continue.',
                needsNewAccount: true,
            }
        case 503:
            return {
                message:
                    'Riot is rate limiting StatBox right now. Try again in a minute.',
                needsNewAccount: false,
            }
        default:
            return {
                message: "Couldn't reach Riot right now. Try again shortly.",
                needsNewAccount: false,
            }
    }
}

// Shown inside a stream overlay, so it is short; the widget keeps polling
// on its own, which is what "retrying" promises.
export function describeWidgetError(error: unknown) {
    if (error === null) return 'Invalid widget link'

    switch (statusOf(error)) {
        case 400:
            return 'Invalid widget link'
        case 404:
            return 'Summoner not found'
        case 503:
            return 'Riot rate limited, retrying…'
        default:
            return 'Riot unreachable, retrying…'
    }
}
