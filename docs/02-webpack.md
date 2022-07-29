# Webpack
## 00. 팁
vscode에는 현재 폴더를 임시 서버로 만들어서 정적호스팅을 하고, 변경사항을 바로 렌더링 할 수 있게 해주는 live-server 플러그인이 있다.  

그런데, vscode live-server는 webpack과 같은 번들러를 통한 번들링 과정을 수행할 수 없으므로, nodejs 용 live-server가 필요하다 ([참고](https://www.quora.com/Why-not-use-the-VS-Code-live-server-extension-instead-of-installing-Node-js-and-then-installing-a-http-server-package-through-NPM)).  
이 강의에선 `lite-server`라는 Node 패키지를 사용한다.  
`npm install lite-server` 명령어로 설치할 수 있으며, 어차피 개발할 때 사용할거니 전역으로 설치해도 된다.

npx 명령어를 통해 다음과 같이 실행한다.  
`npx lite-server`  
명령어를 입력하면 현재 디렉토리를 경량 Nodejs 웹 서버로 만들어주고 실행시킨다.
## 01. webpack이 필요한 이유와 기본 동작
### webpack 등장 이전의 모듈
1. webpack 등장 이전 모듈 운용 방식의 원리
    - `sum` 메서드 정의 후, 이를 직접 사용하는 방식 (파일만 분리) 
        - math.js의 `sum` 메서드를 app에서 불러와서, index.html에 로드해보자
        ```
        // math.js
        function sum(a, b) {
            return a+b
        }
        // app.js
        console.log(sum(1,2));
        // index.html
        ...
        <script src="./src/math.js"></script>
        <script src="./src/app.js"></script>
        ...
        ```
        - index.html에 math,app을 모두 불러와서 사용해야 하는 이 방식은, **전역 스코프의 오염** 이라는 문제 야기한다.
        - 즉, index.html에 불러온 다른 js파일에서 math.js의 `sum`메서드를 사용할 수 있게 된다.
    - IIFE 방식의 운영
        - Self-Excution Anonymous Function 이라는 디자인 패턴의 일종
        - 즉시실행함수(Immediately Invoked Function Expression) 문법을 사용하는 방식
            ```javascript
            (function() {
                // statement
            })();
            ```
        - 위의 math/app 파일을 다음과 같이 변경함
            ```javascript
            // math.js
            var math = math || {};
            (function () {
                function sum(a, b) {
                    return a + b;
                }

                math.sum = sum;
            })
            // app.js
            console.log(math.sum(1,2));
            ```
            - 익명함수 내에 메서드를 정의함으로써, 외부에서 `sum`에 직접 접근할 수 없음. 대신 `math`객체를 통해 접근해야 함 (`math.sum()`)
            - 전역스코프에 메서드/변수를 추가하지 않으니, 스코프 오염을 야기하지 않음
2. Webpack 등장 이전, 모듈 명세
    - CommonJS
        - 모든 JS에서 사용가능한 명세.. 를 목표로 함
        - `exports` 키워드로 모듈을 만들고, `require()`함수로 모듈을 불러들이는 방식
        - 대표적으로 **Node.js**에서 CommonJS 명세를 사용한다.
            ```javascript
            // math.js
            exports function sum(a,b) { return a+b; }
            // app.js
            const sum = require('./math.js')
            sum(1,2);
            ```
    - AMD
        - 비동기 모듈 명세 (Asynchronous Module Definition)로, 비동기 로딩 환경에서 모듈을 사용하는것을 목표로 함 (비동기 로딩 환경 == 외부에서 JS코드를 로딩해야하는 환경)
        - 주로 **브라우져**환경에서 사용함
    - UMD
        - Universial Module Definition
        - CommonJS + AMD 모두 포함하는 명세
    - ES2015 **표준** 모듈 시스템
        - `export`, `import` 를 사용하는 방식
            ```javascript
            // math.js
            export function sum(a,b) { return a+b; }
            // app.js
            import * as math from './math.js';
            math.sum(1,2);
            ```
3. 브라우져의 모듈 지원
    - ES2015 표준 모듈 시스템을 지원하지 않는 IE같은 브라우져도 있음
    - 크롬에서도 `<script type="text/javascript" src="./src/app.js">`로는 사용 불가.
        - `type`을 `module`로 해줘야 함 (`<script type="module" src="./src/app.js">`)
    - 되든 안되든, 아무튼 **모듈을 사용하는 방식이 브라우져 마다 다름**
4. Webpack이 필요한 이유
    - 우린 브라우져마다 다르게 코드를 작성하고 싶지 않다. 하지만, 그렇게 하지 않으려면 모듈을 사용하면 안된다. 하나의 큰 js파일만 작성하면 굳이 모듈 시스템을 사용하지 안아도 된다!
    - 미친소리다. 개발자들은 유지 보수할 수 없는 거대한 스파게티 코드를 만들고 싶지 않다.
    - 그렇다면 **먼저 모듈로 개발한 뒤, 모듈간 의존성을 잘 파악하여 하나의 js파일로 합치면 되지 않을까?** 그렇다. 이게 webpack의 역할이다. 드디어 **webpack이 필요한 시점이다.**
## 02. 엔트리/아웃풋
- 번들(Bundle)
    ![img](./img/module-with-dependencies.png)
    - 모듈을 사용하게 되면 위 이미지 처럼 여러 파일들이 의존성을 가진체 얽히고 설켜있게 된다
    - 이를 하나의 큰 정적 소스로 만드는 작업을 **번들링(Bundling)**이라 일컫는다.
        ![img](./img/bundling.png)
    - webpack이 이걸 해준다
- webpack 설치
    - webpack 패키지 : `npm install webpack`
    - webpack-cli : `npm install webpack-cli`
    - -> package.json > dependencies에 추가됨 + node_modules > .bin 에 추가됨
- webpack 실행(번들링) 필수 옵션 세 가지
    - mode
        - mode에 따라 최적화 수준 / 번들링 패키지가 달라짐
        - `development`, `production`,`none`
    - entry
        - 번들링 할 모듈 중 시작점을 명시해야함
        - entry module 을 기준으로 의존성검사 드감
    - output
        - 번들링 결과인 정적 소스를 저장할 경로
    - cli를 이용한 번들링 예시
        - `node_module/.bin/webpack --mode development --entry ./src/app.js --output dist/main`
        - app.js와 math.js가 main.js이라는 하나의 파일로 번들링 된다.
        - 항상 cli로 옵션을 다 넣어서 실행할 수 없으니, 프로젝트 폴더에 설정파일을 만들어서 관리하는게 좋다.
- 설정파일을 이용한 번들링
    - 프로젝트 폴더에 'webpack.config.js' 파일을 만든다
        ```javascript
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
        ```
    - 만들어진 설정 파일은 webpack-cli의 --config 옵션으로 넣을 수 있다.
        - `node_module/.bin/webpack --config ./webpack.config.js`
        - 사실 디폴트가 webpack.config.js라서 이렇게 명시하지 않아도 된다.
    - package.json에 명령어 alias를 추가할 수도 있다 
        - package.json > scripts 에 다음과 같이 추가한다
            - `"build" : "webpack"`
            - 이렇게 스크립트에 추가하면 알아서 node_modules/.bin에서 실행가능한 파일을 읽어와서 실행시켜준다.
            - 다시말하지만, `--config webpack.config.js` 는 디폴트라서 안써줘도 된다.
        - 터미널에서 다음과같이 webpack을 실행할 수 있게 되었다
            - `npm run build`            
## 03. 로더
## 04. 플러그인