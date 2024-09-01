const axios = require("axios");
const cheerio = require("cheerio");

const puppeteer = require("puppeteer");

const flipkartScraper = async (productName) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
  
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    );
  
    await page.goto(
      `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`,
      { waitUntil: "networkidle2" }
    );
  
    await page.waitForSelector(".Nx9bqj", { timeout: 10000 }).catch(() => {
      console.log("Price element not found on the page.");
    });
  
    const priceElements = await page.$$eval(".Nx9bqj", (elements) =>
      elements.map((element) => element.innerText)
    );
  
    const prices = priceElements.map((price) => parseFloat(price.replace(/[^0-9.-]+/g, "")));
    const minPrice = Math.min(...prices);
  
    await browser.close();
    return minPrice || null;
  };

  const amazonScraper = async (productName) => {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
  
    const priceElements = $(".a-price-whole");
    
    const prices = priceElements
      .map((index, element) => parseFloat($(element).text().replace(/[^0-9.-]+/g, "")))
      .get();
    const minPrice = Math.min(...prices);
  
    return minPrice || null;
  };

module.exports = { flipkartScraper, amazonScraper };
