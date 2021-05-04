require("dotenv").config()

const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

const {  getUserList, findUserById } = require('./user')
const userList = getUserList()
const { getVenueList, findVenueById  } = require('./venue')
const venueList = getVenueList()
const { getPhotoList, findPhotoById  } = require('./photo')
const photoList = getPhotoList()

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json')

app.use(express.json())

// GET
app.get('/users', authenticateToken, (req, res) => {
  res.json(userList.filter(post => post.username === req.user.name))
})

app.get('/venues', authenticateToken, (req, res) => {
  res.json(venueList)
})

app.get('/venues/:id', (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  const venueFound=findVenueById(id)

  const venue= {
    id: venueFound.body.id,
    isPublic: venueFound.body.isPublic,
    name: venueFound.body.name,
    address: venueFound.body.address,
  }

  if (!venueFound) {
    return res.status(404).send({
      success: 'false',
      message: 'venue not found',
    });
  }

  return res.status(200).send({
    success: "true",
    message: "venue found",
    venue,
  })
})

app.get("/venues/:venue_id/photos/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  const photoFound=findPhotoById(id)

  const photo= {
    id: photoFound.body.id,
    isPublic: photoFound.body.isPublic,
    venue_id: photoFound.body.venue_id,
    author_id: photoFound.body.author_id,
  }

  if (!photoFound) {
    return res.status(404).send({
      success: 'false',
      message: 'photo not found',
    })
  }
  return res.status(200).send({
    success: "true",
    message: "photo found",
    photo,
  })

})



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// REFRESH TOKEN ARRAY
let refreshTokens = []

// CREATE ACCESS TOKEN USING REFRESH TOKEN
app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

// LOGOUT
app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

//LOGIN
app.post('/login', (req, res) => {
  //Authenticate user

  const username = req.body.username
  const password = req.body.password
  const user = { name: username, pass: password }

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' })
}

//POST
app.post("/users", (req, res) => {

  if (!req.body.username) {
    return res.status(400).send({
      success: "false",
      message: "username is required",
    })
  } else if (!req.body.password) {
    return res.status(400).send({
      success: "false",
      message: "password is required",
    })
  }
  const user = {
    id: userList.length + 1,
    isPublic: req.body.isPublic,
    username:  req.body.username,
    password: req.body.password
  }
  userList.push(user);
  return res.status(201).send({
    success: "true",
    message: "user added successfully",
    user,
  })
})

app.post("/venues", (req, res) => {

  if (!req.body.name) {
    return res.status(400).send({
      success: "false",
      message: "name is required",
    })
  } else if (!req.body.address) {
    return res.status(400).send({
      success: "false",
      message: "address is required",
    })
  }
  const venue = {
    id: venueList.length + 1,
    isPublic: req.body.isPublic,
    name:  req.body.name,
    address: req.body.address
  }
  venueList.push(venue);
  return res.status(201).send({
    success: "true",
    message: "venue added successfully",
    venue,
  })
})

app.post("/venues/:id/photos", (req, res) => {

  if (!req.body.venue_id) {
    return res.status(400).send({
      success: "false",
      message: "id of venue is required",
    })
  } else if (!req.body.author_id) {
    return res.status(400).send({
      success: "false",
      message: "id of author is required",
    })
  }
  const photo = {
    id: photoList.length + 1,
    isPublic: req.body.isPublic,
    venue_id:  req.body.venue_id,
    author_id: req.body.author_id
  }
  venueList.push(photo);
  return res.status(201).send({
    success: "true",
    message: "photo added successfully",
    photo,
  })
})

//PUT
app.put("/user/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  const userFound=findUserById(id)

  if (!userFound) {
    return res.status(404).send({
      success: 'false',
      message: 'user not found',
    })
  }

  const updatedUser= {
      isPublic: req.body.isPublic || userFound.body.isPublic,
      username:req.body.name || userFound.body.name,
      password:req.body.password || userFound.body.password,
  }

  if (!updatedUser.username) {
    return res.status(400).send({
      success: "false",
      message: "username is required",
    })
  } else if (!updatedUser.password) {
    return res.status(400).send({
      success: "false",
      message: "password is required",
    })
  }

  for (let i = 0; i < userList.length; i++) {
      if (userList[i].id === id) {
          userList[i] = updatedUser;
          return res.status(201).send({
            success: 'true',
            message: 'user updated successfully',
            updatedUser
          })
      }
  }
  return  res.status(404).send({
            success: 'true',
            message: 'error in update'
     })
})

app.put("/venues/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  const venueFound=findVenueById(id)

  if (!venueFound) {
    return res.status(404).send({
      success: 'false',
      message: 'venue not found',
    })
  }

  const updatedVenue= {
      isPublic: req.body.isPublic || venueFound.body.isPublic,
      name:req.body.name || venueFound.body.name,
      address:req.body.address || venueFound.body.address,
  }

  if (!updatedVenue.name) {
    return res.status(400).send({
      success: "false",
      message: "name is required",
    })
  } else if (!updatedUser.address) {
    return res.status(400).send({
      success: "false",
      message: "address is required",
    })
  }

  for (let i = 0; i < venueList.length; i++) {
      if (venueList[i].id === id) {
          venueList[i] = updatedVenue;
          return res.status(201).send({
            success: 'true',
            message: 'venue updated successfully',
            updatedVenue
          })
      }
  }
  return  res.status(404).send({
            success: 'true',
            message: 'error in update'
     })
})

app.put("/venues/:id/photos/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  const photoFound=findPhotoById(id)

  if (!photoFound) {
    return res.status(404).send({
      success: 'false',
      message: 'photo not found',
    })
  }

  const updatedPhoto= {
      isPublic: req.body.isPublic || photoFound.body.isPublic,
      venue_id:req.body.venue_id || photoFound.body.venue_id,
      author_id:req.body.author_id || photoFound.body.author_id,
  }

  if (!updatedPhoto.venue_id) {
    return res.status(400).send({
      success: "false",
      message: "venue id is required",
    })
  } else if (!updatedUser.author_id) {
    return res.status(400).send({
      success: "false",
      message: "author id is required",
    })
  }

  for (let i = 0; i < venueList.length; i++) {
      if (venueList[i].id === id) {
          venueList[i] = updatedPhoto;
          return res.status(201).send({
            success: 'true',
            message: 'photo updated successfully',
            updatedPhoto
          })
      }
  }
  return  res.status(404).send({
            success: 'true',
            message: 'error in update'
     })
})

//DELETE
app.delete("/venues/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  console.log(id)
  for(let i = 0; i < venueList.length; i++){
      if(venueList[i].id === id){
           venueList.splice(i,1);
           return res.status(201).send({
            success: 'true',
            message: 'venue deleted successfully'
          })
      }
  }
  return res.status(404).send({
              success: 'true',
              message: 'error in delete'
    })
})

app.delete("/venues/:venue_id/photos/:id", (req, res) => {
  console.log(req.params)
  const id = parseInt(req.params.id, 10);
  console.log(id)
  for(let i = 0; i < photoList.length; i++){
      if(photoList[i].id === id){
           photoList.splice(i,1);
           return res.status(201).send({
            success: 'true',
            message: 'photo deleted successfully'
          })
      }
  }
  return res.status(404).send({
              success: 'true',
              message: 'error in delete'
    })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3001)

// References
// https://github.com/kirti/node-express-swagger-crud
// https://levelup.gitconnected.com/how-to-add-swagger-ui-to-existing-node-js-and-express-js-project-2c8bad9364ce
