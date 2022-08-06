module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage", //폴리필 사용 방식 지정
          corejs: {
            // 폴리필 버전 지정
            version: 2,
          },
        },
      ],
    ],

};
