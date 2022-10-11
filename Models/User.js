const mongoose = require('mongoose');
const {isEmail} = require('validator')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    email: {
        type: String,
        required: [true, 'Please enter a email'],
        unique: [true, 'Duplicate email'],
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password should be atleast 6 characters long']
    }
})

//should never use arrow function while dealing with mongoose schema, 
//mongoose does not support it, however it wont throw any error, but functionality will be limited
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email});
    if(user){
        const isAuth = await bcrypt.compare(password, user.password);
        if(isAuth){
            return user;
        }
        else{
            throw Error('incorrect password')
        }
    }else{
        throw Error("incorrect email")
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;