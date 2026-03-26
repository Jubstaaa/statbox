export function validateSummonerForm(name: string, tag: string) {
    const errors: { name?: string; tag?: string } = {}
    const cleanName = name.trim()
    const cleanTag = tag.trim().replace(/^#/, '')

    if (!cleanName) errors.name = 'Game Name is required'
    if (!cleanTag) errors.tag = 'Tag is required'
    else if (cleanTag.length > 10) errors.tag = 'Tag is too long'

    return { cleanName, cleanTag, errors }
}
