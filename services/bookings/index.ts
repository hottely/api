const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) =>
  res.json([
    {
      id: "1",
      name: "Booking 1",
    },
  ])
);
app.listen(port, () =>
  console.log(`Bookings service listening on port:`, port)
);
