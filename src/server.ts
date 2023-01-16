import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

//-----------------------------------------------------------------------------------------------------setting DATABASE variables
dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (req, res) => {
  res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

app.get("/health-check", async (req, res) => {
  try {
    //For this to be successful, must connect to db
    await client.query("select now()");
    res.status(200).send("system ok");
  } catch (error) {
    //Recover from error rather than letting system halt
    console.error(error);
    res.status(500).send("An error occurred. Check server logs.");
  }
});

//-----------------------------------------------------------------------------------------------------requests to DATABASE for USERS table
app.get("/users", async (req, res) => {
  const users = await client.query(
    "SELECT * FROM users ORDER BY user_id"
  );
  res.status(200).json(users);
});

app.get<{ user_id: number }>("/users/:user_id", async (req, res) =>{

  const user_id = req.params.user_id;

  if (user_id === undefined) {
    res.status(404).json(user_id);
  } else {
   const user = await client.query(`SELECT * FROM users WHERE user_id = ${user_id}`);


    res.status(200).json(user);
  }

});

app.post("/users", async (req, res) => {
  const user_name = req.body.user_name;
  const user_isfaculty = req.body.user_isfaculty

  const text = `INSERT INTO users(user_name, user_isfaculty)  VALUES($1,$2)`;

  const values = [user_name, user_isfaculty];

  const postData = await client.query(text, values);

  res.status(201).json(postData);
});

app.delete<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const delete_user = req.params.user_id;
  if (delete_user === undefined) {
    res.status(404).json(delete_user);
  } else {
    await client.query(`DELETE FROM comments WHERE user_id = ${delete_user}`);
    await client.query(`DELETE FROM resources WHERE user_id = ${delete_user}`);
    await client.query(`DELETE FROM users WHERE user_id = ${delete_user}`);

    res.status(200).json(delete_user);
  }
});

app.patch<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const patch_user = req.params.user_id;
  if (patch_user === undefined) {
    res.status(404).json(patch_user);
  } else {
    const new_user_name = req.body.new_user_name;

    await client.query(`UPDATE users SET user_name = '${new_user_name}'  WHERE user_id = ${patch_user}`);

    res.status(200).json(patch_user);
  }
});

//-----------------------------------------------------------------------------------------------------requests to DATABASE for RESOURCES table

//-----------------------------------------------------------------------------------------------------requests to DATABASE for COMMENTS table


//-----------------------------------------------------------------------------------------------------connecting to DATABASE
connectToDBAndStartListening();

async function connectToDBAndStartListening() {
  console.log("Attempting to connect to db");
  await client.connect();
  console.log("Connected to db!");

  const port = getEnvVarOrFail("PORT");
  app.listen(port, () => {
    console.log(
      `Server started listening for HTTP requests on port ${port}.  Let's go!`
    );
  });
}
