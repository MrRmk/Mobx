const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    
    //Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
    entry: path.resolve(__dirname, 'src/index.jsx'), //指定入口文件，程序从这里开始编辑，__dirname当前所在目录，../表示上一级目录，./同级目录
    output: {
        path: path.resolve(__dirname, 'dist'),  //输出的路径
        filename: 'main.js'  //打包后文件
        //filename: 'app/[name]_[hash:8].js' //打包后文件
    },
    //Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,    //使用正则匹配所有需要使用此loader的文件
                //loader: 'babel-loader', //Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
                exclude: /node_modules/, //忽略node_modules下面的js|jsx文件
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react'],
                        plugins: ['transform-decorators-legacy', 'transform-class-properties', 'syntax-decorators']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    devtool: 'inline-source-map',
    mode: 'development'
    //Plugin：扩展插件，在 Webpack 构建流程中的特定时机会广播出对应的事件，插件可以监听这些事件的发生，在特定时机做对应的事情。
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         template: path.resolve(__dirname, '../src/index.template.html'),
    //         inject: true
    //     })
    // ]
    //Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。
    //Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
}