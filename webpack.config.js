const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const DIST_DIR = path.resolve(__dirname, 'nf-virtru-plugin');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
    entry: {
        'admin/assets/js/decrypt': `./src/admin/decrypt/index.js`,
        'admin/assets/js/policyPage': `./src/admin/policyPage/index.js`,
        'assets/js/bundle': `./src/frontend/index.js`,
    },
    output: {
        path: DIST_DIR,
        filename: '[name].js',
    },
    node: {
        'fs': 'empty'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    SRC_DIR,
                ],
                loader: 'babel-loader',
                options: {
                    configFile: path.join(__dirname, 'babel.config.js'),
                },
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 1,
                            modules: true,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: path.join(__dirname, '.'),
                            },
                        },
                    },
                ],
            },
        ]

    },
    plugins: [
        new CopyPlugin([
            { from: 'admin', to: 'admin' },
            { from: 'assets', to: 'assets' },
            { from: '*.php' },
        ]),
    ]
};