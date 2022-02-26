const {ConfigParamsMap, closeStdin, getInput, compress} = require('./packager');
const child_process = require('child_process');

const configParamsMap = new ConfigParamsMap();

(async function(){
    await configParamsMap.requireValues();
    const config = configParamsMap.create();


    let target = config.target;
    let source  = config.source;

    if (!config.needConfirm || config.needConfirm && (await getInput(`确认导出? (y/n) `)).toLowerCase() === 'y') {
        compress(source, target)
        .then(() => {
            console.log('导出完毕')

            if (config.autoImport) {
                child_process.exec(`start ${target}`);
            }
            
        })
        .catch(e => console.error(e));
    }
    

    closeStdin();
})()