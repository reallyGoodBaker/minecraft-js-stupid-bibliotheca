# Addon-Packager

命令行一键打包。



#### 使用

1. 在 packager 目录下执行 ` npm install `
2. 配置 ` config.json ` <a href="#config">在下方查看</a>
3. 使用 ` npm start ` 或 ` node pack `  进行打包 





## config.json<div id="config"></div>



#### 基本属性

| 属性        | 类型    | 功能                                 |
| ----------- | ------- | ------------------------------------ |
| source      | string  | 指定需要打包的文件夹目录             |
| target      | string  | 指定打包后存放的位置                 |
| params      | any[]   | 声明自定义变量, 可使用${}获得        |
| autoImport  | boolean | 是否在导出完成后自动使用对应程序打开 |
| needConfirm | boolean | 是否需要二次确认                     |



#### 特殊功能

` ${} ` 访问符

* 你可以在值中插入${}表示它代表一个变量，比如: ` ${dataPath}/thumbNail ` 就表示 ` dataPath ` 变量拼接 ` /thumbNail ` , 这个变量可以通过 ` params ` 声明，<del>也可以通过 ` modifier ` 使用 js 进行注入</del> (暂未实现)。
* ` params ` 属性中的值也可以使用 `${}` , 若有未声明过的变量，则会在打包过程中提示你在控制台手动输入。





## Link

有什么好点子随时可以联系我~

QQ: 2433479855

E-mail: reallyGoodBaker@foxmail.com
