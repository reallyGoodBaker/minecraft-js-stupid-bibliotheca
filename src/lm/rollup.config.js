const ts = require('rollup-plugin-typescript2')
const terser = require('@rollup/plugin-terser')

module.exports = [
    {
        input: './index.ts',
        output: {
            file: '../../dist/lm/index.js',
            format: 'es',
        },
        plugins: [
            ts(),
            terser(),
        ]
    },
    {
        input: './test.ts',
        output: {
            file: '../../test/lm/index.mjs',
            format: 'es'
        },
        plugins: [
            ts(),
            terser(),
        ]
    },
]