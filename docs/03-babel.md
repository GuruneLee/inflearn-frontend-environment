# Babel
: 바벨탑을 아는가? 인간들의 오만함에 분노한 신이 서로의 언어를 다르게 만들어, 결국 끝까지 세우지 못했다는 건축물이다. \
프론트엔드 코드도 비슷한 고충을 겪는다. 브라우져 스팩에 따라 이해하는 스펙이 다르다. 프론트엔드라는 바벨탑이 무너질 수 있는 중요한 문제점이다. \
\
바벨탑은 무너졌지만, 프론트엔드 코드는 무너지지 않는다. **바벨**이 있어 가능하다. 바벨은 **크로스브라우징 환경의 스펙 호환성**을 지켜준다. 바벨은 **ECMAScript2015+로 작성한 코드를 모든 브라우져에서 동작하도록 트랜스파일** 해준다.

## 바벨의 기본 동작
- `npm install @babel/core @babel/cli`:     코어 패키지와 cli 패키지를 모두 설치하자
- 바벨로 변환될 만한 코드를 작성하자
```javascript
// app.js
// const 와 arrow는 ES6 부터 사용가능하다
// IE는 이거 해석못함 ㅋㅋ
const alert = mst => window.alert(msg);
```
- 바벨을 실행해보자
    - `node_modules/.bin/babel app.js` 또는
    - `npx babel app.js`\
    ![img](./img/bebel-result.PNG)
    - 어라 바뀌지 않았다. 왜 안바꼈을까?
- 트랜스파일은 총 세 단계로 진행된다
    - **파싱, 변환, 출력**
    - 파싱 : 코드를 AST로 변환하는 단계
    - 변환 : 각 노드를 알맞게 바꾸는 단계
    - 출력 : 변환한 AST를 코드로 재조합 하는 단계\
    이 중, **파싱과 출력은 바벨이 해준다**. \
    **변환은 플러그인이 한다**. 
## 커스텀 플러그인 (변환)
위에서 바벨이 파싱과 출력을 하는 것을 확인했다. 이제 플러그인을 붙여서 '변환'과정이 어떻게 일어나는지 확인해보자.\
커스텀 플러그인 my-babel-plugin.js 를 작성하자. \
```javascript
module.exports = function myBabelPlugin() {
    return {
        visitor: {
            identifier(path) {
                const name = path.node.name;

                // 바벨이 만든 AST 노드를 출력
                console.log(name)

                // 변환 작업
                // ... 생략 ...
            }
        }
    }
}
```
- plugin을 붙여서 바벨을 실행해보자
    - `npx babel app.js --plugins my-babel-plugin.js`\
    + ![#f03c15](https://via.placeholder.com/15/f03c15/f03c15.png)어라... 동작을 안한다...
        - plugin의 상대 경로는 현재 폴더 기준을 해줘야 하는 것 같다
        - my-babel.js 이 아니라 ./my-babel.js 이렇게
        - 참고로 윈도우 파우쉘에서는 .\\으로 자동완성 되는데, 반드시 '/'를 사용해야 한다.

## 서드파티 플러그인 사용하기
아래 소개하는 npm 패키지는 모두 바벨 플러그인이다.\
공통적으로 '@babel/plugin-'이라는 prefix가 붙은것을 확인할 수 있다.
1. @babel/plugin-transform-block-scoping
2. @babel/plugin-transform-block-scoping
3. @babel/plugin-transform-strict-mode

## babel.config.js 으로 설정하기
babel.config.js 에 사용할 변환 플러그인을 모아놓고, 실행시 이 설정파일을 레퍼런싱하게 만들면 더 쉽다.
```javascript
// babel.config.js
module.exports = {
    plugins: [
        "@babel/plugin-transform-block-scoping",
    ]
}
```
이렇게 작성하고, npx babel app.js 를 입력하면 잘 작동한다. config파일을 자동으로 잡아주기 때문!
## 바벨 프리셋 (플러그인 설정 간략화)
위처럼 일일히 필요한 플러그인을 다운받아서 설정파일에 넣는것도 좋지만, 애초에 자주쓰는 플러그인들을 모아놓으면 더 편할 것이다.
### 커스텀 프리셋
일단 내가 필요한 프리셋을 만들어서 가져다 써보자
```javascript
// my-babel-preset.js
module.exports = function myBabelPreset() {
    return {
        plugins: [
            "@babel/plugin-transform-block-scoping",
        ]
    }
}
// babel.config.js
module.exports = {
    presets: [
        './my-babel-preset.js'
    ]
}
```
- 미묘한 차이점을 눈여겨 보자. config에서 'presets'이라는 프로퍼티를 사용한다.
- 그것말고는 뭐.. 괘안타

## 폴리필
ECMAScript2015+ 중 ECMAScript5 문법으로 '변환' 할 수 없는 문법을 ECMAScript5로 '구현'할 수 있도록 하는 코드조각.\
**폴리필 이라는 코드 조각을 코드 상단에 넣어놓고 사용하는 방식 이다.**
\
예를 들어 `Promise`는 문법 변환은 안되지만, 폴리필로서 구현은 가능하다.\
core-js, babel-js 등이 있다.
```javascript
// babel.config.js
module.exports = {
    presets: {
        presets: [
            [
                '@babel/preset-env', 
                {
                    useBuiltIns: 'usage', //폴리필 사용 방식 지정
                    corejs: { // 폴리필 버전 지정
                        version: 2
                    }
                }
            ]
        ]
    }
}
// app.js
new Promise();
```
- 이렇게 app.js에 `Promise` 문법을 넣어두고, 폴리필을 사용한다 설정하면 다음과 같이 폴리필을 불러오는 부분이 코드 상단에 추가됨을 확인할 수 있다
```javascript
// npx build app.js 결과물 (console로 찍음)
"use strict";

require("core-js/modules/es6.object.to-string.js");

require("core-js/modules/es6.promise.js");
    
new Promise();
```

## 웹팩으로 통합
지금까지는 babel만 사용해서 코드를 변경 시켰다.\
잘 생각해 보면, babel이 하는 일은 웹팩의 로더나 플러그인과 비슷하다. js코드를 받아서 js코드를 리턴하는 함수이므로.\
\
웹팩에서는 이런 **babel을 '로더'의 형태로 제공**한다.\
바로 **babel-loader**가 그것이다.\
`npm install -D babel-loader`
```javascript
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.css$/, 
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            // ....
            {
                test: /\.js$/,
                use: [
                    'babel-loader'
                ]
            }
        ]
    },
    // ...
}
```
- 근데 그냥 이렇게 하면 에러가 난다. 왜냐면 폴리필 설정을 해서 core-js를 가져오는 코드가 추가되었지만, node_modules에는 core-js가 포함되어있지 않아 가져올 수가 없다
- 설치하면 된다. `npm i core-js@2`
- 끝
