import typescript from '@rollup/plugin-typescript'

export default {
    input: 'api/index.ts',
    output: [
        {
            file: '../../dist/console/api/index.js',
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