require('dotenv').config()

let appdata = [
  { 'recipeName': 'Basic Pan-Fried Chicken', 
    'ingredients': ['1lb chicken', '1/4 cornstarch', 'salt', 'pepper'], 
    'instructions' : ['Season chicken with salt and pepper', 'Coat both side with cornstarch', 'Drizzle oil and heat pan to medium-high',
      'Once hot, pan-fry the chicek for 5 minutes on each side'], 
    'cookTime': 20,
    'difficulty': 'simple'},
  { 'recipeName': 'Hamburger', 
    'ingredients': ['1lb ground beef', '1 bun', '1 slice of cheese', 'garlic powder', 'onion powder', 'onion salt', 'garlic salt'],
    'instructions' : ['Form beef into 4 1/4lb patties', 'Season one side with garlic powder and onion salt',
      'Season other side with onion powder and garlic salt', 'Cook on high for 5 minutes on each side',
      'As the 2nd side cookies, add a slice of cheese'],
    'cookTime': 15,
    'difficulty': 'moderate'}]

const express = require('express'),
       { MongoClient, ObjectId } = require('mongodb'),
      app = express()

app.use(express.static('public'))
app.use(express.json())

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.HOST}`
console.log('uri :', uri)
const client = new MongoClient(uri)

let collection = null

async function run() {
  await client.connect()
  collection = await client.db("cookbook").collection("recipes")

  //middleware to calculate difficulty before data is added or updated in database
  const deriveDifficulty = (req, res, next) => {
    const numIngredients = req.body.ingredients.length,
        numStep = req.body.instructions.length,
        cookTime = req.body.cookTime

    let diffSum = 0.016*cookTime+ 0.05*numIngredients+0.1*numStep
    if (diffSum < 1){
      req.body.difficulty = 'easy'
      }
    else if (diffSum > 1.5){
      req.body.difficulty = 'hard'
    }
    else{
      req.body.difficulty = 'moderate'
    }  
    next()
  }

  //middleware to check connection
  app.use( (req, res, next) => {
    if(collection !== null){
      next()
    }
    else{
      res.status(503).send
    }
  })

  // route to get all docs
  app.get("/docs", async (req, res) => {
    const docs = await collection.find({}).toArray()
    res.json( docs )
  })

  //add item to DB
  app.post( '/add', deriveDifficulty,  async (req,res) => {
    const result = await collection.insertOne( req.body )
    res.json( result )
  })

  //remove item from DB 
  // where req.body is of form like {_id:5d91fb30f3f81b282d7be0dd } for 
  app.post( '/remove', async (req,res) => {
    const result = await collection.deleteOne({ 
      _id:new ObjectId( req.body._id ) })
    res.json( result )
  })

  app.post( '/update', deriveDifficulty, async (req,res) => {
    const result = await collection.updateOne(
      { _id: new ObjectId( req.body._id ) },
      { $set:{ recipeName : req.body.recipeName,
              ingredients : res.body.ingredients,
              instructions : res.body.instructions,
              
       } })

    res.json( result )
  })
}

run()

app.listen( 3000 )