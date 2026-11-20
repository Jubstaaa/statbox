/** @type {import('prettier').Config} */
const config = {
    arrowParens: 'avoid',
    bracketSameLine: true,
    plugins: ['prettier-plugin-tailwindcss'],
    quoteProps: 'consistent',
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
}

export default config
