const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2tqgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connect to the database');

        const database = client.db('travelMate');
        const toursCollection = database.collection('tours');
        const ordersCollection = database.collection('orders');


        // GET API FOR TOURS
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.json(tours);
        });



        // GET API FOR SINGLE Tour

        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific tour', id);
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.json(tour);
        });

        // POST API FOR TOUR
        app.post('/tours', async (req, res) => {
            const tour = req.body;
            console.log('hit the post api', tour);

            const result = await toursCollection.insertOne(tour);
            console.log(result);
            res.json(result)
        });

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders)
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            console.log('getting email', email);
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //UPDATE API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body);
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved ',

                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })

        // DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello bro travelMate .')
});
app.listen(port, () => {
    console.log('listening from port', port);
});