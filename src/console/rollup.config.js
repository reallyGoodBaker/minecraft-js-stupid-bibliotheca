import typescript from '@rollup/plugin-typescript'

export default {
    input: 'index.ts',
    output: [
        {
            file: '../../dist/console/index.js',
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