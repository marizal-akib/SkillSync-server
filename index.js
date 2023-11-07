const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
const port = process.env.Port || 5000;

// middleware
dotenv.config()
app.use(cors());
app.use(express.json());
console.log(process.env.USER);
console.log(process.env.PASS);

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.1oalrlh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const jobCollection = client.db('skillSyncDB').collection('jobCollection')
    const userCollection = client.db('skillSyncDB').collection('user')

    app.get('/jobs', async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      let query = {}
      if (req.query?.category) {
        query = { category: req.query.category }
      }

      const result = await jobCollection.find(query).skip(page * size).limit(size).toArray();
      res.send(result);
    })
    app.get('/all_jobs', async (req, res) => {
      let query = {}
      if (req.query?.category) {
        query = { category: req.query.category }
      }
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server port no. ${port}`);
})