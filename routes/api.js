/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var axios = require("axios");

var MongoClient = require("mongodb").MongoClient;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const singleStockProcess = async ({stock, like, ip, data, db}) => {
  let dbStock = await db.collection("stocks").findOne({ stock: stock });
  if (!dbStock) {
    let r = await db.collection("stocks").insertOne({
      stock: stock,
      likes: [],
      price: data.latestPrice
    });
    dbStock = r.ops[0];
  }
  let likes = [...dbStock.likes];
  if (like && dbStock.likes.indexOf(ip) < 0) {
    likes = [...dbStock.likes, ip];
  }
  const updatedStock = await db
    .collection("stocks")
    .findOneAndUpdate(
      { stock: stock },
      { $set: { likes: likes, price: data.latestPrice } },
      { returnOriginal: false }
    );
  return updatedStock.value;
};

module.exports = function(app) {
  app.route("/api/stock-prices").get(async function(req, res) {
    const reqStock = req.query.stock;

    const like = req.query.like ? 1 : 0;
    const ip = req.ip;

    const client = new MongoClient(CONNECTION_STRING, {
      useUnifiedTopology: true
    });

    if (!Array.isArray(reqStock)) {
      const stock = reqStock.toUpperCase();
      const requestURI =
        process.env.LIVE_API +
        "/stock/" +
        stock +
        "/quote?token=" +
        process.env.TOKEN;

      // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
      const stockData = await axios.get(requestURI);

      client.connect(async (err, client) => {
        if (err) console.log(err);

        const db = client.db(process.env.DB_NAME);

        const updatedStock = await singleStockProcess({stock, like, ip, data: stockData.data, db});

        res.json({
          stockData: {
            ...updatedStock,
            likes: updatedStock.likes.length
          }
        });
      });
    } else {
      const stock = reqStock.map(stock => stock.toUpperCase());
      const requestURI =
        process.env.LIVE_API +
        "/stock/market/batch?types=quote&symbols=" +
        stock +
        "&token=" +
        process.env.TOKEN;

      // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
      try {
        const stockData = await axios.get(requestURI);

        const stock1Data = stockData.data[stock[0].toUpperCase()].quote;
        const stock2Data = stockData.data[stock[1].toUpperCase()].quote;

        client.connect(async (err, client) => {
          if (err) console.log(err);

          const db = client.db(process.env.DB_NAME);
          try {
            const dbStock1 = await singleStockProcess({
              stock: stock[0],
              like,
              ip,
              data: stock1Data,
              db
            });
            const dbStock2 = await singleStockProcess({
              stock: stock[1],
              like,
              ip,
              data: stock2Data,
              db
            });

            const relLikes1 = dbStock1.likes.length - dbStock2.likes.length;
            const relLikes2 = dbStock2.likes.length - dbStock1.likes.length;

            const returnStocks = [
              { ...dbStock1, rel_likes: relLikes1 },
              { ...dbStock2, rel_likes: relLikes2 }
            ];
            res.json({ stockData: returnStocks });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
};
