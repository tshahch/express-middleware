const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
        throw new Error('EMAIL IS INVALID')
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 10,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error ('PASSWORD CANNOT CONTAIN "password" WORD')
            }
        }
    },
    age : {
        type : Number,
        default: 0,
        validate(value) {
           if(value<0) {
               throw new Error('AGE MUST BE POSITIVE NUMBER')
           }
        }
    },
    tokens : [ {
        token : {
            type : String,
            required: true
        }
    }]
})
//...............HIDING USER PASSWORD AND TOKENS.........//
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}
//...................JSON WEB TOKEN....................................//
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString() },'thisismynewtest')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
//................ONLY CREDENTIALS USER CAN LOGIN........................//
userSchema.statics.findByCredentials = async(email, password) => {
const user = await User.findOne({ email})
if(!user) {
    throw new Error ('UNABLE TO LOGIN')
}
const isMatch = await bcrypt.compare(password, user.password)
if(!isMatch) {
    throw new Error ('UNABLE TO LOGIN')
}
return user
}
//...............CONVERTING PLAIN TEXT PASSWORD INTO HASHING PASSWORD..........//

userSchema.pre('save', async function(next) {
const user = this
if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
}
next()
})

const User = mongoose.model('User', userSchema)
module.exports = User