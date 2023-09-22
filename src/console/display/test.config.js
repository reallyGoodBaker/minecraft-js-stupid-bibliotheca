import typescript from '@rollup/plugin-typescript'

export default {
    input: 'display/test.ts',
    output: [
        {
            file: '../../dist/console/test/display/index.js',
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