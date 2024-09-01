// routes/productRoutes.js
const express = require('express');
const { flipkartScraper, amazonScraper } = require('../scrapers/productScraper');

const router = express.Router();

module.exports = (supabase) => {
  router.post('/compare', async (req, res) => {
    const { productName } = req.body;

    try {
      const [flipkartPrice, amazonPrice] = await Promise.all([
        flipkartScraper(productName),
        amazonScraper(productName),
      ]);

      // Insert data into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([{ name: productName, flipkart_price: flipkartPrice, amazon_price: amazonPrice }]);

      if (error) {
        throw error;
      }

      res.json({
        productName,
        flipkartPrice,
        amazonPrice,
        bestDeal: flipkartPrice < amazonPrice ? 'Flipkart' : 'Amazon',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching product prices' });
    }
  });

  return router;
};