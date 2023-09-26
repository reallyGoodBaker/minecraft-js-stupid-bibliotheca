import typescript from '@rollup/plugin-typescript'

export default {
    input: 'api/test.ts',
    output: [
        {
            file: '../../dist/console/test/api/index.js',
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