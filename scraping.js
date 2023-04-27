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

  const selector01 = ".articleTtl";
  const selector02 = ".listTtl";
  const selector03 = ".summary";
  const selector04 = ".linkWrap a";

  const targets = [
    {
      selector: selector01,
      childrens: [
        {
          selector: selector02,
          isMultiple: false,
        },

        {
          selector: selector03,
          isMultiple: false,
        },

        {
          selector: selector04,
          isMultiple: true,
        },
      ]
    },
  ];

  let results = [];

  // Promise.allを使用してすべての子要素を非同期で取得する
  await Promise.all(targets.map(async (target) => {
    const targetParent = await page.$(target.selector);
    const targetResult = {};
    await Promise.all(target.childrens.map(async (children) => {
      let childrenResult = null;
      if (children.isMultiple) {
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
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hours = today.getHours();
  const minutes = today.getMinutes();

  const outputStream = fs.createWriteStream(`./dist/${year}${month}${day}${hours}${minutes}-results.csv`);
  outputStream.write('Title,Summary,Links\n');
  results.forEach(result => {
    const title = result[selector02].textContent;
    const summary = result[selector03].textContent;
    const links = result[selector04] ? result[selector04].map(element => element.href).join(' | ') : '';
    const row = `${title},${summary},${links}\n`;
    outputStream.write(row);
  });
  outputStream.end();

  browser.close();
};

scrape();