export function getInputStateClasses(error?: string) {
    return error
        ? 'border-loss/50 focus:border-loss'
        : 'border-border-secondary focus:border-accent'
}
