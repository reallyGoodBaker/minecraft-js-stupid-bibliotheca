import typescript from '@rollup/plugin-typescript'

export default {
    input: 'core/index.ts',
    output: [
        {
            file: '../../dist/console/core/index.js',
            format: 'esm'
        }
    ],
    plugins: [
        typescript({
            compilerOptions: {
                target: "ESNext",
            }
        })
    ]
}