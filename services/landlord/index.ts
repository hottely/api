const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/properties", (req, res) =>
  res.json([
    {
      id: "1",
      city: "Bucharest",
      size: 200,
    },
  ])
);

app.listen(port, () =>
  console.log(`Landlord service listening on port:`, port)
);
