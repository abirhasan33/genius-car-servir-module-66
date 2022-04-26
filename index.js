const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { query } = require('express');
const res = require('express/lib/response');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// modlewere
app.use(cors());
app.use(express.json());

function verifJWT(req, res, next){
    const authHeder = req.headers.authorization;
    console.log("inside veryfujwt", authHeder); 
    if(!authHeder){
        return res.status(401).send({message: 'unauthorrized access'});
    }
    const token = authHeder.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbiden access'})
        }
        console.log('decoded', decode);
        req.decode = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0vsrm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviseCollection = client.db('geniuscCar').collection('service');
        const orderCollection = client.db('geniuscCar').collection('order');

        // AUTH
        app.post('/login', async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send(accessToken);
        })

        // SEVICES API;
        app.get('/service', async(req, res)=> {
            const query = {};
            const cursor = serviseCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviseCollection.findOne(query);
            res.send(service);
        });

        // POST
        app.post('/service', async(req, res) => {
            const newServise = req.body;
            const result = await serviseCollection.insertOne(newServise);
            res.send(result); 
        });

        // DELET 
        app.delete('/service', async(req, res) => {
            const id = req.params.id;
            const qurey = {_id: ObjectId(id)};
            const result = await serviseCollection.deleteOne(query);
            res.send(result);
        });

        // Order collection API 
        app.get('/order', verifyJWT, async(req, res) => {
            // const authHeder = req.headers.authorization;
            const decoedEmail = req.decode.email;
            if(email === decoedEmail){
                const email = req.query.email;
                const query = {email: email};
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message: 'fobiden access'})
            }
        })


        // Orde clloectio apl 
        app.post('/order', async(req, ses) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('Running Genius Server');
});

app.listen(port, ()=> {
    console.log('Listening to port', port);
})