const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        'http://localhost:5173',
        // 'https://volunteerhub-cc355.web.app',
        // 'https://volunteerhub-cc355.firebaseapp.com',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Verify jwt middlewares
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    console.log('token in the middleware', token);
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(401).send({ message: "unauthorized access" })
            }
            req.user = decoded;
            next();
        })
    }
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p3ukwfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const productsCollection = client.db("techHubDB").collection("products");
        const reviewsCollection = client.db("techHubDB").collection("reviews");

        // verify admin middleware
        const verifyAdmin = async (req, res, next) => {
            console.log('hello')
            const user = req.user
            const query = { email: user?.email }
            const result = await usersCollection.findOne(query)
            console.log(result?.role)
            if (!result || result?.role !== 'admin')
                return res.status(401).send({ message: 'unauthorized access!!' })

            next()
        }
        // verify host middleware
        const verifyHost = async (req, res, next) => {
            console.log('hello')
            const user = req.user
            const query = { email: user?.email }
            const result = await usersCollection.findOne(query)
            console.log(result?.role)
            if (!result || result?.role !== 'host') {
                return res.status(401).send({ message: 'unauthorized access!!' })
            }

            next()
        }

        // auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '365d',
            })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                })
                .send({ success: true })
        })
        // Logout
        app.get('/logout', async (req, res) => {
            try {
                res
                    .clearCookie('token', {
                        maxAge: 0,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    })
                    .send({ success: true })
                console.log('Logout successful')
            } catch (err) {
                res.status(500).send(err)
            }
        })


        // Service related api

        // read all Featured Products data for homePage
        app.get('/feature-product', async (req, res) => {
            const result = await productsCollection.find().sort({ createdAt: -1 }).toArray();
            res.send(result);
        })

        // read all Tending Products data for homePage
        app.get('/trend-product', async (req, res) => {
            const result = await productsCollection.find().sort({ upvote_count: -1 }).toArray();
            res.send(result);
        })

        // Read a single data for product details page
        app.get('/product-details/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.send(result);
        })

        // read all reviews data for product details page
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // Create/save review data from the Post Review section
        app.post('/addReviews', async (req, res) => {
            const addReview = req.body;
            // console.log(addReview);
            const result = await reviewsCollection.insertOne(addReview);
            res.send(result);
        })

        // Search data by tag for product Page
        app.get('/search', async (req, res) => {
            const search = req.query.search;
            // console.log(search);
            let query = {
                tags: { $regex: search, $options: 'i' }
            };
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('TechHub SERVER IS RUNNING')
})
app.listen(port, () => {
    console.log(`TechHub server is running on port: ${port}`)
})