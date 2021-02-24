const express = require("express");
const app = express();
require("./loaders/mongoose");

const { port } = require("./configs");

const { expressLoader, logger } = require("./loaders");

expressLoader(app);

app.listen(port, err => {
  if (err) {
    logger.error(err);
    process.exit(1);
    return;
  }
  logger.info(`
      ########################################
      🛡️ Server listening on port: ${port} 🛡️ 
      ########################################
    `);
});
