require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const stream = require('stream');

const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    defaultViewport: null
  });

  const page = await browser.newPage();
  const url = process.env.PAGE_URL;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // --- スクレイピング要素指定変数
  const selectorItemWrap = ".item";
  const selectorTitle = ".title";
  const selectorText = ".text";
  const selectorLink = ".link";
  // ---

  const targets = [
    {
      selector: selectorItemWrap,
      childrens: [
        {
          selector: selectorTitle,
          isLink: false,
        },

        {
          selector: selectorText,
          isLink: false,
        },

        {
          selector: selectorLink,
          isLink: true,
        },
      ]
    },
  ];

  const targetParents = await page.$$(selectorItemWrap);
  const results = [];

  // Promise.allを使用してすべての子要素を非同期で取得する
  await Promise.all(targetParents.map(async (targetParent) => {
    const targetResult = {};
    await Promise.all(targets[0].childrens.map(async (children) => {
      let childrenResult = null;
      if (children.isLink) {
        childrenResult = await targetParent.$$eval(children.selector, elements => elements.map(element => ({ textContent: element.textContent, href: element.href })));
      } else {
        childrenResult = await targetParent.$eval(children.selector, element => ({ textContent: element.textContent }));
      }
      targetResult[children.selector] = childrenResult;
    }));
    results.push(targetResult);
  }));

  console.log(results);

  // CSVファイルに書き込む
  const today = new Date();
  const year = today.getFullYear();
  const month = ('00' + (today.getMonth() + 1)).slice(-2);
  const day = ('00' + today.getDate()).slice(-2);
  const hours = ('00' + today.getHours()).slice(-2);
  const minutes = ('00' + today.getMinutes()).slice(-2);

  const outputStream = fs.createWriteStream(`./dist/${year}${month}${day}${hours}${minutes}-results.csv`);
  outputStream.write('Title,Summary,LinksText,LinksUrl\n');
  results.forEach(result => {
    const title = result[selectorTitle].textContent;
    const summary = result[selectorText].textContent;
    const linksText = result[selectorLink] ? result[selectorLink].map(element => element.textContent).join('★★|★★') : '';
    const linksUrl = result[selectorLink] ? result[selectorLink].map(element => element.href).join('★★|★★') : '';
    const row = `${title},${summary},${linksText},${linksUrl}\n`;
    outputStream.write(row);
  });
  outputStream.end();

  browser.close();
};

scrape();
