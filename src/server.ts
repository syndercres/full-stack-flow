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

//-----------------------------------------------------------------------------------------------------Configure express routes
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
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for all users
app.get("/users", async (req, res) => {
  const users = await client.query("SELECT * FROM users ORDER BY user_id");
  res.status(200).json(users.rows);
});
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for user by user_id
app.get<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  if (user_id === undefined) {
    res.status(404).json(user_id);
  } else {
    const user = await client.query(
      `SELECT * FROM users WHERE user_id = ${user_id}`
    );

    res.status(200).json(user.rows);
  }
});

//-----------------------------------------------------------------------------------------------------POST request to DATABASE for user with BODY
app.post("/users", async (req, res) => {
  const user_name = req.body.user_name;
  const user_isfaculty = req.body.user_isfaculty;

  const text = `INSERT INTO users(user_name, user_isfaculty)  VALUES($1,$2)`;

  const values = [user_name, user_isfaculty];

  const postData = await client.query(text, values);

  res.status(201).json(postData.rows);
});

//-----------------------------------------------------------------------------------------------------DELETE request to DATABASE by user_id
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

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE for user_name by user_id
app.patch<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const patch_user = req.params.user_id;
  if (patch_user === undefined) {
    res.status(404).json(patch_user);
  } else {
    const new_user_name = req.body.new_user_name;

    await client.query(
      `UPDATE users SET user_name = '${new_user_name}'  WHERE user_id = ${patch_user}`
    );

    res.status(200).json(patch_user);
  }
});

//-----------------------------------------------------------------------------------------------------requests to DATABASE for RESOURCES table
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for ALL resources
app.get("/resources", async (req, res) => {
  const resources = await client.query(
    "SELECT * FROM resources ORDER BY resource_post_date DESC"
  );
  res.status(200).json(resources.rows);
});

//-----------------------------------------------------------------------------------------------------GET request to DATABASE for resource by resource_id
app.get<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const resource_id = req.params.resource_id;

    if (resource_id === undefined) {
      res.status(404).json(resource_id);
    } else {
      const resource = await client.query(
        `SELECT * FROM resources WHERE resource_id = ${resource_id} ORDER BY resource_post_date`
      );

      res.status(200).json(resource.rows);
    }
  }
);

//-----------------------------------------------------------------------------------------------------POST request to DATABASE for resource with BODY
app.post("/resources", async (req, res) => {
  console.log(req.body);
  const resource_name = req.body.resource_name;
  const author_name = req.body.author_name;
  const user_id = req.body.user_id;
  const resource_description = req.body.resource_description;
  const resource_tags = req.body.resource_tags;
  const resource_content_type = req.body.resource_content_type;
  const resource_user_recommendation = req.body.resource_user_recommendation;
  const resource_recommendation_reason =
    req.body.resource_recommendation_reason;
  const resource_likes = req.body.resource_likes;
  const resource_dislikes = req.body.resource_dislikes;
  const resource_link = req.body.resource_link;

  const text = `INSERT INTO resources (resource_post_date, resource_name, author_name, user_id, resource_description, resource_tags, resource_content_type, resource_user_recommendation, resource_recommendation_reason, resource_likes, resource_dislikes, resource_link)
  VALUES (now(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;

  const values = [
    resource_name,
    author_name,
    user_id,
    resource_description,
    resource_tags,
    resource_content_type,
    resource_user_recommendation,
    resource_recommendation_reason,
    resource_likes,
    resource_dislikes,
    resource_link,
  ];

  const postData = await client.query(text, values);

  res.status(201).json(postData.rows);
});

//-----------------------------------------------------------------------------------------------------DELETE request to DATABASE by resource_id
app.delete<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const delete_resource = req.params.resource_id;
    if (delete_resource === undefined) {
      res.status(404).json(delete_resource);
    } else {
      await client.query(
        `DELETE FROM comments WHERE resource_id = ${delete_resource}`
      );
      await client.query(
        `DELETE FROM resources WHERE resource_id = ${delete_resource}`
      );

      res.status(200).json(delete_resource);
    }
  }
);

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE tp update likes counter
app.patch<{ resource_id: number }>(
  "/resources/likes/:resource_id",
  async (req, res) => {
    const resource_id = req.params.resource_id;
    try {
      await client.query(
        `UPDATE resources SET resource_likes = (resources.resource_likes + 1) WHERE resource_id = $1`,
        [resource_id]
      );
      res.status(200).json("Updated likes!");
    } catch (error) {
      res.status(400).json("Failed to update the like count.");
    }
  }
);

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE tp update likes counter
app.patch<{ resource_id: number }>(
  "/resources/dislikes/:resource_id",
  async (req, res) => {
    const resource_id = req.params.resource_id;
    try {
      await client.query(
        `UPDATE resources SET resource_dislikes = (resources.resource_dislikes + 1) WHERE resource_id = $1`,
        [resource_id]
      );
      res.status(200).json("Updated dislikes!");
    } catch (error) {
      res.status(400).json("Failed to update the like count.");
    }
  }
);

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE for resource by resource_id
app.patch<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const patch_resource = req.params.resource_id;
    if (patch_resource === undefined) {
      res.status(404).json(patch_resource);
    } else {
      const resource_name = req.body.resource_name;
      const author_name = req.body.author_name;
      const user_id = req.body.user_id;
      const resource_description = req.body.resource_description;
      const resource_tags = req.body.resource_tags;
      const resource_content_type = req.body.resource_content_type;
      const resource_user_recommendation =
        req.body.resource_user_recommendation;
      const resource_recommendation_reason =
        req.body.resource_recommendation_reason;
      const resource_likes = req.body.resource_likes;
      const resource_dislikes = req.body.resource_dislikes;
      const resource_link = req.body.resource_link;

      const text = `UPDATE resources SET resource_post_date = now(), resource_name = $1, author_name = $2, user_id = $3, resource_description = $4, resource_tags = $5, resource_content_type = $6, resource_user_recommendation = $7, resource_recommendation_reason = $8, resource_likes = $9, resource_dislikes=$10, resource_link = $11
  
  WHERE resource_id = ${patch_resource}`;

      const values = [
        resource_name,
        author_name,
        user_id,
        resource_description,
        resource_tags,
        resource_content_type,
        resource_user_recommendation,
        resource_recommendation_reason,
        resource_likes,
        resource_dislikes,
        resource_link,
      ];

      const postData = await client.query(text, values);

      res.status(201).json(postData.rows);
    }
  }
);

//-----------------------------------------------------------------------------------------------------requests to DATABASE for COMMENTS table
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for ALL comments
app.get("/comments", async (req, res) => {
  const comments = await client.query(
    "SELECT * FROM comments ORDER BY comment_time"
  );
  res.status(200).json(comments);
});

//-----------------------------------------------------------------------------------------------------GET request to DATABASE for comments by resource_id
app.get<{ resource_id: number }>("/comments/:resource_id", async (req, res) => {
  const resource_id = req.params.resource_id;

  if (resource_id === undefined) {
    res.status(404).json(resource_id);
  } else {
    const resource = await client.query(
      `SELECT * FROM comments left join users on comments.user_id = users.user_id WHERE resource_id = ${resource_id} ORDER BY comment_time`
    );

    res.status(200).json(resource);
  }
});

app.post("/comments", async (req, res) => {
  const user_id = req.body.user_id;
  const resource_id = req.body.resource_id;
  const comment_text = req.body.comment_text;
  const comment_likes = 0;

  const text = `INSERT INTO comments(user_id, resource_id, comment_text,comment_time,comment_likes)  VALUES($1,$2,$3,now(),$4)`;

  const values = [user_id, resource_id, comment_text, comment_likes];

  const postData = await client.query(text, values);

  res.status(201).json(postData.rows);
});

//-----------------------------------------------------------------------------------------------------DELETE request to DATABASE by comment_id
app.delete<{ comment_id: number }>(
  "/comments/:comment_id",
  async (req, res) => {
    const delete_comment = req.params.comment_id;
    if (delete_comment === undefined) {
      res.status(404).json(delete_comment);
    } else {
      await client.query(
        `DELETE FROM comments WHERE comment_id = ${delete_comment}`
      );

      res.status(200).json(delete_comment);
    }
  }
);

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE by comment_id
app.patch<{ comment_id: number }>("/comments/:comment_id", async (req, res) => {
  const patch_comment = req.params.comment_id;

  if (patch_comment === undefined) {
    res.status(404).json(patch_comment);
  } else {
    const new_comment_text = req.body.new_comment_text;
    const text = `UPDATE comments SET comment_text = '${new_comment_text}'
  
    WHERE comment_id = ${patch_comment}`;

    const postData = await client.query(text);

    res.status(201).json(postData);
  }
});

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE tp update likes counter for comments
app.patch<{ comment_id: number }>(
  "/comments/likes/:comment_id",
  async (req, res) => {
    const comment_id = req.params.comment_id;
    try {
      await client.query(
        `UPDATE comments SET comment_likes = (comments.comment_likes + 1) WHERE comment_id = $1`,
        [comment_id]
      );
      res.status(200).json("Updated likes!");
    } catch (error) {
      res
        .status(400)
        .json("Failed to update the like count in comments table.");
    }
  }
);

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
