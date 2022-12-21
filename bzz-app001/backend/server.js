
const app = require("./app");
const sql = require('mssql')
const sharepoint = require('./controllers/sharepoint')



const PORT = parseInt(process.env.PORT) || 8000;
// Make sure we are running node 10.0+
const [major, minor] = process.versions.node.split(".").map(parseFloat);
if (major < 10 || (major === 10 && minor <= 0)) {
  console.log(
    "Please go to nodejs.org and download version 10 or greater. 👌\n "
  );
  process.exit();
}

// import environmental variables from our variables.env file
require("dotenv").config({ path: ".variables.env" });

let dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: false },
  connectionTimeout : 99999999,
  requestTimeout: 99999999,
};

async function connectToDatabase() {
  console.log(`Checking database connection...`);
  try {
    await sql.connect(dbConfig);
    console.log("Database connection OK!");
    sharepoint.loadMF()
    sharepoint.loadMC()

    
  } catch (error) {
    console.log("Unable to connect to the database:");
    console.log(error);
    process.exit(1);
  }
}
// Start our app!

async function init() {
  console.log("Waiting 1 minute for MSSQL DB to initialize")
  console.log(dbConfig)
  // await new Promise(resolve => setTimeout(resolve, 60000));
  await connectToDatabase();


  // app.set("port", parseInt(process.env.PORT) || 8000);
  const server = app.listen(PORT, () => {
    console.log(
      `Starting MS SQL + Express → On PORT : ${server.address().port}`
    );
  });

  server.timeout = 10000000;
}

init();


