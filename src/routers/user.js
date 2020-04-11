const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

//...............CREATING USER ENDPOINTS.........//
router.post('/users', async (req, res) => {
    const user = new User (req.body)
    try {
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).send({user, token}) 
   
    } catch(e) {
       res.status(404).send(e)
   
    }
   
   })

//...................USER LOGIN ENDPOINTS .........//
router.post('/users/login', async(req, res) => {
    try {
   const user = await User.findByCredentials(req.body.email, req.body.password)
   const token = await user.generateAuthToken()
   res.send({user, token})
    } catch(e) {
    res.status(400).send('UNABLE TO LOGIN')
    }
})
//..................USER LOGOUT ENDPOINTS..............//
router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
         await req.user.save()
         res.send()
    } catch(e) {
      res.status(500).send(e)   
    }

})
//..............USER LOGOUTALL ENDPOINTS.........////
router.post('/users/logoutall', auth, async(req, res) => {
    try {
      req.user.tokens = []
      await req.user.save()
      res.send()
    } catch(e) {
      res.status(500).send()
    }
})



   //................FETCHING PROFILE ENDPOINTS....///
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)   

   })
   
   //.................UPDATING USER ENDPOINT ..............//
   router.patch('/users/me', auth,async(req, res) => {
   
       //.......ONLY GIVEN PARAMETES ARE ALLOWED TO CHANGE......//
       
       const updates = Object.keys(req.body)
       const allowedUpdates = ['name', 'email', 'password', 'age']
       const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
       if(!isValidOperation) {
          return res.status(400).send({ error: 'INVALID UPDATES ARE NOT ALLOWED....'})
       }
       //.........................................................//
       try {
           
           updates.forEach((update) => req.user[update] = req.body[update])
           await req.user.save()

          res.send(req.user)
       } catch(e) {
          res.status(500).send(e)
       }
   })
   //..................DELETING ENDPOINT FOR USER BY ID..............
router.delete('/users/me', auth, async(req, res) => {
   try {
   await req.user.remove()
   res.send(req.user)
   } catch(e) {
   res.status(500).send()
   }
   })
   

module.exports = router