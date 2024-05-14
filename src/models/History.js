const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId } } = Schema

const historySchema = new Schema({
    borrowedBookId: {
        type: ObjectId,
        required: true,
        ref: 'Book'
    },
    borrowedUserId: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    borrowedAt: {
        type: Date,
        default: Date.now
    },
    returnedAt: {
        type: Date
    },
    expiredAt: {
        type: Date
    },
    borrowStatus: {
        type: String,
        default: '대출'
    }
})

historySchema.path('borrowStatus').validate(function(value){
    return /대출|연장|연체|반납/.test(value)
}, 'borrowStatus `{VALUE}` 는 유효하지 않은 상태입니다.')

const History = mongoose.model('History', historySchema)
module.exports = History