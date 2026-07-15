require("dotenv").config();
const app = require("./app");

const PORT = 30011;

app.listen(PORT, () => {
  console.log(`Server is listening to ${PORT}`);
});
