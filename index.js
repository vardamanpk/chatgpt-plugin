const express = require("express");
const axios = require('axios');
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.use("/exclude-test", (req, res) => {
  res.send("served from local server");
});

app.post("/v1/oauth", async (req, res) => {
  console.log('body: ', req.body)
  console.log('header: ', JSON.stringify(req.headers))
  const auth = Buffer.from(`${req.body.client_id}:${req.body.client_secret}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = `grant_type=authorization_code&code=${req.body.code}&redirect_uri=${encodeURIComponent(req.body.redirect_uri)}`;

    try {
        const response = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', data, { headers });
        console.log('res:', response.data);
        return res.json(response.data);
    } catch (error) {
        console.log('error:', error);
        return res.status(500).json({ error: error.toString() });
    }
})

app.post("/invoices", (req, res) => {
  console.log('body: ', req.body)
  console.log('header: ', JSON.stringify(req.headers))
  res.json({success: true, URL: "https://paypal.com/invoice/p/#INV2-1234-1234-1234"})
})
app.post("/send", (req, res) => {
  console.log('body1: ', req.body)
  console.log('header1: ', JSON.stringify(req.headers))
  res.json({success: true, URL: "https://paypal.com/invoice/p/#INV2-1234-1234-1234"})
})

app.use(
  "/",
  createProxyMiddleware({
    target: "https://api-m.sandbox.paypal.com",
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
      let responseData = "";

      proxyRes.on("data", function (chunk) {
        responseData += chunk;
      });

      proxyRes.on("end", function () {
        console.log(
          "Response Headers from forwarded server:",
          proxyRes.headers
        );
        console.log("Response from forwarded server:", responseData);
      });
    },
  })
);

app.listen(port, () => {
  console.log(`chatgpt paypal plugin server listening on port ${port}`);
});
