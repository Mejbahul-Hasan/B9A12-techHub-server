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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p3ukwfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// verify jwt middlewares
// const verifyToken = (req, res, next) => {
//     const token = req.cookies?.token;
//     console.log('token in the middleware', token);
//     if (!token) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     if (token) {
//         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
//             if (err) {
//                 console.log(err)
//                 return res.status(401).send({ message: "unauthorized access" })
//             }
//             req.user = decode;
//             next();
//         })
//     }
// }
// const cookieOption = {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//     secure: process.env.NODE_ENV === "production" ? true : false,
// }

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        // const servicesCollection = client.db("techHubDB").collection("services");

        // Auth related api: jwt generate
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     // console.log('user for token', user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        //     res.cookie('token', token, {
        //         httpOnly: true,
        //         secure: process.env.NODE_ENV === 'production',
        //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //     })

        //     res.send({ success: true });
        // })

        // app.post('/logOut', async (req, res) => {
        //     const user = req.body;
        //     // console.log('logging out', user);
        //     res
        //         .clearCookie('token', { ...cookieOption, maxAge: 0 })
        //         .send({ success: true });
        // });


        // Service related api

        // read all services data for homePage
        // app.get('/services', async (req, res) => {
        //     const result = await servicesCollection.find().sort({ Deadline: 1 }).toArray();
        //     res.send(result);
        // })

        

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