const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const mongoose = require('mongoose')
const axios = require('axios')
const User = require('./src/models/User')
const Book = require('./src/models/Book')
const config = require('./config')
const usersRouter = require('./src/routes/users')
const booksAdminRouter = require('./src/routes/books(admin)')
const booksCommonRouter = require('./src/routes/books(common)')
const {isAuth} = require('./auth')
const {limitUsage} = require('./limiter')

const corsOptions = {
    origin: '*',
    credentials: true
}

mongoose.connect(config.MOGODB_URL)
.then(() => console.log('데이터베이스 연결 성공'))
.catch(e => console.log(`데이터베이스 연결 실패: ${e}`))

app.use(cors(corsOptions))
app.use(express.json())
app.use("/api", limitUsage)

app.use('/api/books', booksCommonRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin/books', booksAdminRouter)


// let books = {}
// let user = null

// app.use('/users/:uname/books', (req, res, next) => {
//     req.user = req.params.uname
//     user = req.user
//     // console.log(`${user} 사용자 추가`)
//     next()
// })

// app.get('/users/:uname/books', (req, res, next) => {
//     console.log(`${user} 사용자 전체 대출 도서 조회`)
//     res.send(`사용자명: ${user} / 대출 도서 목록: ${books[user] ? books[user].map(book => book.title) : '없음'}`)
// })

// app.post('/users/:uname/books', (req, res, next) => {
//     console.log(`사용자명: ${user} / 추가 대출 도서: ${req.query.book}`)
//     const book = {title: req.query.book, description: `${req.query.book}에 대한 이야기`}
//     if(!books[user]){
//         books[user] = [book]
//     }else{
//         books[user].push(book)
//     }
//     res.send(books)
// })

// app.get('/users/:uname/books/:name', (req, res, next) => {
//     const searchedBook = books[user].find(book => book.title === req.params.name)
//     console.log(`${user} 사용자의 ${searchedBook.title} 도서 조회`)
//     res.send(`도서 제목: ${searchedBook.title} / 도서 내용: ${searchedBook.description}`)
// })

// app.put('/users/:uname/books/:name', (req, res, next) => {
//     const searchedBook = books[user].find(book => book.title === req.params.name)
//     console.log(`사용자명: ${user} / 변경 도서: ${searchedBook.title}`)
//     searchedBook.title = req.query.book
//     res.send(`도서 제목: ${searchedBook.title} / 도서 내용: ${searchedBook.description}`)
// })

// app.delete('/users/:uname/books/:name', (req, res, next) => {
//     const deletedBooks = books[user].filter(book => book.title !== req.params.name)
//     books[user] = deletedBooks
//     console.log(`사용자명: ${user} / 삭제 도서: ${req.params.name}`)
//     res.send(books)
// })

app.use((req, res, next) => {
    res.status(404).send('페이지를 찾을수 없습니다.')
})
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send('서버 에러')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
