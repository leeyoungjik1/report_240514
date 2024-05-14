const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId } } = Schema

const bookSchema = new Schema({
    bookId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true
    },
    release: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
})

bookSchema.path('category').validate(function(value){
    return /소설|경제|여행|자기계발|과학|건강|IT/.test(value)
}, 'category `{VALUE}` 는 유효하지 않은 카테고리입니다.')

// 2024.05.14
bookSchema.path('release').validate(function(value){
    return /\d{4}\.\d{2}\.\d{2}/.test(value)
}, 'release `{VALUE}` 는 잘못된 날짜 형식입니다.')

const Book = mongoose.model('Book', bookSchema)
module.exports = Book



// const book = new Book({
//     bookId: '000000000000000000000005',
//     title: '3번책',
//     release: '2024-01-01',
//     author: 'e저자'
// })
// book.save().then(() => console.log('책 추가 완료'))