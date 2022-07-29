const path = require('path');

module.exports = { // Node.js 네이티브 모듈 시스템입니당
    mode: 'development', // --mode
    entry: { // --entry
        main: './src/app.js'
    },
    output: { // --output
        path: path.resolve('./dist'), // 디렉토리명
        filename: '[name].js' // 결과파일명
    }
}