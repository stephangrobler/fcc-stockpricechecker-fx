/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      let count = 0;
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
         assert.equal(res.status, 200, 'Status not 200 OK');
         assert.property(res.body.stockData, 'stock', 'Stock is missing');
         assert.property(res.body.stockData, 'price', 'Price is missing');
         assert.property(res.body.stockData, 'likes', 'Likes is missing');
         count = res.body.stockData.likes;
         done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res) {
         // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
           assert.property(res.body.stockData, 'stock', 'Stock is missing');
           assert.property(res.body.stockData, 'price', 'Price is missing');
           assert.property(res.body.stockData, 'likes', 'Likes is missing');
            console.log(res.body.stockData.likes);
           assert.equal(count+1, res.body.stockData.likes, 'Likes increased');
         done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res) {
         // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
           assert.property(res.body.stockData, 'stock', 'Stock is missing');
           assert.property(res.body.stockData, 'price', 'Price is missing');
           assert.property(res.body.stockData, 'likes', 'Likes is missing');
         done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res){
         // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
           assert.property(res.body.stockData[0], 'stock', 'Stock is missing');
           assert.property(res.body.stockData[0], 'price', 'Price is missing');
           assert.property(res.body.stockData[0], 'rel_likes', 'Relative Likes is missing');
          
           assert.property(res.body.stockData[1], 'stock', 'Stock is missing');
           assert.property(res.body.stockData[1], 'price', 'Price is missing');
           assert.property(res.body.stockData[1], 'rel_likes', 'Relative Likes is missing');
         done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end(function(err, res){
         // In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int)
           assert.property(res.body.stockData[0], 'stock', 'Stock is missing');
           assert.property(res.body.stockData[0], 'price', 'Price is missing');
           assert.property(res.body.stockData[0], 'rel_likes', 'Relative Likes is missing');
          
           assert.property(res.body.stockData[1], 'stock', 'Stock is missing');
           assert.property(res.body.stockData[1], 'price', 'Price is missing');
           assert.property(res.body.stockData[1], 'rel_likes', 'Relative Likes is missing');
         done();
        });
      });
      
    });

});
