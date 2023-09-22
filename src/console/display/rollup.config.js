import typescript from '@rollup/plugin-typescript'

export default {
    input: 'display/index.ts',
    output: [
        {
            file: '../../dist/console/display/index.js',
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