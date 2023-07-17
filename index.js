const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.static("public"));

app.use("/exclude-test", (req, res) => {
  res.send("served from local server");
});

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
