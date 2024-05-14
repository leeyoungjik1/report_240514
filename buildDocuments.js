const mongoose = require('mongoose')
const User = require('./src/models/User')
const Book = require('./src/models/Book')
const config = require('./config')
const moment = require('moment')

const category = ['소설', '경제', '여행', '자기계발', '과학', '건강', 'IT']
let users = []

mongoose.connect(config.MOGODB_URL)
.then(() => console.log('데이터베이스 연결 성공'))
.catch(e => console.log(`데이터베이스 연결 실패: ${e}`))


const generateRandomDate = (from, to) => {
    return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()))
}

const selectRandomValue = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)]
}

const generateRandomString = n => {
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const str = new Array(n).fill('a')
    return str.map(s => alphabet[Math.floor(Math.random()*alphabet.length)]).join('')
}
const generateRandomSpecialCharacter = n => {
    const specialCharacter = ["!", "@", "#", "$", "%", "^", "&", "*"]
    const str = new Array(n).fill('a')
    return str.map(s => specialCharacter[Math.floor(Math.random()*specialCharacter.length)]).join('')
}

const generateRandomNumber = n => Math.random().toString().slice(2, n+2)

const createUsers = async (n, users) => {
    console.log('creating users now...')
    for(let i=0; i<n; i++){
        const user = new User({
            name: generateRandomString(5),
            userId: generateRandomString(7),
            password: generateRandomString(9)+generateRandomNumber(1)+generateRandomSpecialCharacter(1)
        })
        users.push(await user.save())
    }
    return users
}

const createBooks = async (n) => {
  console.log(`creating books by now ...`)
  for(let i=0; i<n; i++){
    const releaseDate = moment(generateRandomDate(new Date(1990, 0, 1), new Date(2020, 13, 30))).format("YYYY.MM.DD")
    const book = new Book({
      bookId: generateRandomNumber(13), 
      title: generateRandomString(10),
      category: selectRandomValue(category),
      description: generateRandomString(50),
      release: releaseDate,
      author: generateRandomString(7),
      createdAt: generateRandomDate(new Date(2024, 0, 2), new Date()),
      lastModifiedAt: generateRandomDate(new Date(2024, 0, 2), new Date()),
    })
    await book.save()
  }
}
const buildData = async (users) => {
    users = await createUsers(7, users)
    createBooks(500)
}

buildData(users)