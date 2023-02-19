const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
   role: {
    type: String,
    enum: ['admin','user','guest'],
    default: 'user'
},
    email: {
        type: String,
        require: [true,'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail,'Please enter a valid email']
    },
    password: {
        type: String,
        require: [true, 'Please enter an password'],
        minlength: [6,'Minimum password lenght is 6 characters']
    },
    confirmPassword: {
        type: String,
        require: [true, 'Please enter an password'],
        minlength: [6, 'Minimum password lenght is 6 characters'],
        // enum: {
        //     values: [this.password],
        //     message:'password do not match, repeat again'
        // }
    },
},{ timestamps: true });


//Fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('new user was created and savedd', doc);
    next();
})

//fire a function before doc was saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})


// userSchema.pre('save', async function (next) {
//     if (this.password != this.confirmPassword) {
//         // socket.emit("upload finished");
//         popup.alert({
//     content: 'Hello!'
// });
//         return alert('passwords do not match');
//     } else { next()}
// })


// static method to login user
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        } throw Error('incorrect password');
    }
    throw Error('incorrect email')
};

const User = mongoose.model('User', userSchema);

module.exports = User;