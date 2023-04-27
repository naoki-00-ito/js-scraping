# js-scraping

サイトリニューアル等で、テキストやリンク設定等は既存サイトの内容をそのまま使いたい(構造変更の必要はある)とき用のスクレイピングプラグラム。

## 環境情報

- node 14.16.0
- npm 6.14.11
- puppeteer


## 利用方法

puppeteerをインストールする

```
npm i puppeteer
```

dotenvをインストールする

```
npm install dotenv
```

.env を作成し、スクレイピング対象のページのURLを記述する

```
PAGE_URL=https://www.hoge.hoge
```

スクレイピング要素指定変数を任意のものに書き換える

```diff
- const selectorItemWrap = ".item";
- const selectorTitle = ".title";
- const selectorText = ".text";
- const selectorLink = ".link";
+ const selectorItemWrap = ".col";
+ const selectorTitle = ".col__title";
+ const selectorText = ".col__text";
+ const selectorLink = ".col__link";
```

スクレイピングを実行する

```
node scraping.js
```
