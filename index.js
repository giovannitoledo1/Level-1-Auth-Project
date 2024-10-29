import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/secrets", (req, res) => {
  res.render("secrets.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try{
        await db.query("INSERT INTO authen (email, password) VALUES( $1, $2)", [email, password]);
        res.redirect("/login");
    } catch(error){
      console.log("Error adding item: 0", error);
    }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try{
    const result = await db.query("SELECT * FROM authen WHERE email = $1", [email]);
    if(result.rows.length === 0) {
      res.status(404).send("User not found");
    } else if (password === result.rows[0].password){
      res.redirect("/secrets");
    } else {
      res.status(401).send("Incorrect password");
    }
  } catch(error){
    console.error("Error fetching items: ", error);
    res.status(500).send("Error fetching items");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
