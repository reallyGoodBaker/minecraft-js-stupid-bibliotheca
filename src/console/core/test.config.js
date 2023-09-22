import typescript from '@rollup/plugin-typescript'

export default {
    input: 'core/test.ts',
    output: [
        {
            file: '../../dist/console/test/core/index.js',
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