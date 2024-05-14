const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    rentedBooks: [{
        type: ObjectId,
        default: null
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
})

// 숫자, 특수문자 최소 1개 포함 (7~15자)
userSchema.path('password').validate(function(value){
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}/.test(value)
}, 'password `{VALUE}` 는 잘못된 비밀번호 형식입니다.')

const User = mongoose.model('User', userSchema)
module.exports = User



// const user = new User({
//     name: '이디',
//     userId: 'abc1234',
//     password: '1234',
//     rentedBooks: ['6631d926ad39f82d67464a70', '6631d95999d859c17e9f796b']
// })


// user.save().then(() => console.log('유저 추가 완료'))

