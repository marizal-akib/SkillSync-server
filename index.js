const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
const port = process.env.Port || 5000;

// middleware
dotenv.config()
app.use(cors(({
  origin:[
    'http://localhost:5173'

  ],
  credentials:true
})));
app.use(express.json());
console.log(process.env.USER);
console.log(process.env.PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const jobCollection = client.db('skillSyncDB').collection('jobs')
    const userCollection = client.db('skillSyncDB').collection('user')
    const bidCollection = client.db('skillSyncDB').collection('bid')

    // auth
    app.post('/jwt',async(req,res)=>{

    })

    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    })

    app.get('/jobs', async (req, res) => {
      // console.log(req.query);
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
    app.get('/my_post', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = {
          employerEmail
            : req.query.email
        }
      }
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/job_bid', async (req, res) => {
      const id = req.query?.id
      let query = {}
      if (req.query?.id) {
        query = { _id: new ObjectId(id) }
      }
      console.log(query);
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.put('/update_job/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJob = req.body;
      const job = {
        $set: {
          jobTitle: updateJob.jobTitle,
          minPrice: updateJob.minPrice,
          maxPrice: updateJob.maxPrice,
          category: updateJob.category,
          deadline: updateJob.deadline,
          description: updateJob.description,

        }
      }

      const result = await jobCollection.updateOne(filter, job, options);
      res.send(result);

    })


    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })
    // user


    userCollection.createIndex({ email: 1 }, { unique: true });
    app.post('/user', async (req, res) => {
      const user = req.body;
      // console.log(user);
      try {
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).send('Duplicate entry found. Please provide a unique value.');
        } else {
          res.status(500).send('Internal server error');
        }
      }
    })

    // bid
    bidCollection.createIndex({ jobId: 1 }, { unique: true });
    app.post('/bid', async (req, res) => {
      const newBid = req.body;

      try {
        const result = await bidCollection.insertOne(newBid);
        res.send(result);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).send('Duplicate entry found. Please provide a unique value.');
        } else {
          res.status(500).send('Internal server error');
        }
      }
    })


    app.get('/my_bid', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = {
          bidderEmail
            : req.query.email
        }
      }
      const cursor = bidCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/bid_req', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = {
          employerEmail
            : req.query.email
        }
      }
      const cursor = bidCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.put('/bid_req/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJob = req.body;
      const job = {
        $set: {
          status: updateJob.status,
         

        }
      }

      const result = await bidCollection.updateOne(filter, job, options);
      res.send(result);

    })
    app.put('/complete_job/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJob = req.body;
      const job = {
        $set: {
          status: updateJob.status,
         

        }
      }

      const result = await bidCollection.updateOne(filter, job, options);
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