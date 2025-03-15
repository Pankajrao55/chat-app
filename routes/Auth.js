import express from 'express'
import { GetUser, Login, Register } from '../controllers/Auth.js'
import { upload } from '../middlewares/Mluter.js'

const AuthRoutes=express.Router()

AuthRoutes.post('/register',upload.single('profile'),Register)
AuthRoutes.post('/login', Login)
AuthRoutes.get('/getuser', GetUser)

export default AuthRoutes