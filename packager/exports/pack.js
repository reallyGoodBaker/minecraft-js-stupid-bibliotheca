const {zip} = require('compressing');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


function getConfig() {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, './config.json')))
}

function compress(source, target) {
    source = path.resolve(__dirname, source);
    target = path.resolve(__dirname, target);

    if (!fs.existsSync(target)) {
        fs.writeFileSync(target, 'eof');
    }
    return new Promise((resolve, reject) => {
        zip.compressDir(source, target)
        .then(() => resolve())
        .catch(reason => reject(reason));
    });
}

function getInput(question) {
    return new Promise(res => {
        process.stdout.write(question);
        process.stdin.once('data', data => {
            res(data.toString().trim());
        });
        process.stdin.resume();
    });
}

function closeStdin() {
    process.stdin.destroy();
}

class ConfigParamsMap {

    paramsMap = Object.create(null);

    constructor() {
        this.config = getConfig();
        this.initParamsMap();
    }

    initParamsMap() {
        let params = this.config.params || {};

        for (const k in params) {
            const v = params[k];

            this.paramsMap[k] = v;
        }
    }

    async requireValues(obj) {
        obj = obj || this.config;

        let regExp = /\$\{(.*?)\}/g;
        let undefinedParams = [];
        const pm = this.paramsMap;

        for (const k in obj) {
            const v = obj[k];
            if (typeof v !== 'object') {
                let res;
                while (res = regExp.exec(v)) {
                    let data = res[1];
                    if(!pm[data]) undefinedParams.push(data);
                }
            } else {
                await this.requireValues(v);
            }
        }

        for (let i = 0; i < undefinedParams.length; i++) {
            let name = undefinedParams[i];
            if(!this.paramsMap[name])
                this.paramsMap[name] = await getInput(`请输入 ${name} 的值: `);
        }

    }

    getValue(accessor) {
        let v = this.paramsMap[accessor] || this.config[accessor];

        if(typeof v !== 'string') return v;

        return this.paramsMap[accessor] = this.parseValue(v);
    }

    parseValue(tempString) {
        let regExp = /(\$\{(.*?)\})/;
        let res;
        while (res = regExp.exec(tempString)) {
            tempString = tempString.replace(res[1], this.getValue(res[2]));
        }

        return tempString;
    }

    _create(obj) {
        const self = this;
        return new Proxy(obj, {
            set() {
                return false;
            },
            get(t, p) {
                let val = t[p];
                if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                    return self.parseValue(val);
                }
                if (typeof val === 'object') {
                    let v = self._create(val);
                    return v;
                }
                return val;
            }
        });
    }

    create() {
        return this._create(this.config);
    }

}

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