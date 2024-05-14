const mongoose = require('mongoose')
const User = require('./src/models/User')
const Book = require('./src/models/Book')
const config = require('./config')

const BASE_URL = 'http://127.0.0.1:3000'

mongoose.connect(config.MOGODB_URL)
.then(() => console.log('데이터베이스 연결 성공'))
.catch(e => console.log(`데이터베이스 연결 실패: ${e}`))

async function login(userId, password){
    const userJSON = await fetch(`${BASE_URL}/api/users/login`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            userId, password
        })
    })
    const user = await userJSON.json()
    return user
}
async function rentBooks(bookId, user){
    let base_url = `${BASE_URL}/api/users/books/borrow/${bookId}`
    const borrowUserJSON = await fetch(`${BASE_URL}/api/users/books/borrow/${bookId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        },
        method: 'POST',
    })
    const borrowUser = await borrowUserJSON.json()
    return borrowUser
}

async function fetchData(userId, password, bookId){
    const user = await login(userId, password)
    const borrowUser = await rentBooks(bookId, user)
    return borrowUser
}

const usersArr = []

// 랜덤한 3명의 유저에게 랜덤한 7권의 책을 대출
User.aggregate().sample(3) 
.then((users) => { 
    users.forEach(user => {
        usersArr.push({userId: user.userId, password: user.password})
    })
    return usersArr
})
.then((usersArr) => {
    for(let i=0; i<usersArr.length; i++){
        const userId = usersArr[i].userId
        const password = usersArr[i].password
        Book.aggregate().sample(7) 
        .then((books) => { 
            books.forEach(book => {
                fetchData(userId, password, book._id)
                .then(borrowUser => {
                    if(borrowUser.userId === undefined){
                        console.log(borrowUser)
                    }else{
                        console.log(`${borrowUser.userId} 사용자 대출 완료`)
                    }
                })
            })
        })
    }
    return 
})

