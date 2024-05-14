const express = require('express')
const User = require('../models/User')
const History = require('../models/History')
const { generateToken, isAuth } = require('../../auth')
const expressAsyncHandler = require('express-async-handler')
const booksUserRouter = require('./books(user)')
const moment = require('moment')
const { validationResult, oneOf } = require('express-validator')
const { validateUserName, validateUserPassword } = require('../../validator')

const router = express.Router()

router.use('/books', booksUserRouter)

// 회원가입
router.post('/register', [
    validateUserName(),
    validateUserPassword()
], expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code: 400,
            message: 'Invaild Form data for user',
            error: errors.array()
        })
    }else{
        console.log(req.body)
        const user = new User({
            name: req.body.name,
            userId: req.body.userId,
            password: req.body.password
        })
        const newUser = await user.save()
        if(!newUser){
            res.status(400).json({code: 400, message: '유저 등록 정보 에러'})
        }else{
            const {name, userId, isAdmin, rentedBooks, createdAt} = newUser
            res.json({
                code: 200,
                token: generateToken(newUser),
                name, userId, isAdmin, rentedBooks, createdAt
            })
        }
    }
}))

// 로그인
router.post('/login', expressAsyncHandler(async (req, res, next) => {
    console.log(req.body)
    const loginUser = await User.findOne({
        userId: req.body.userId,
        password: req.body.password
    })
    if(!loginUser){
        res.status(401).json({code: 401, messager: '유효하지 않은 로그인 정보'})
    }else{
        renewDelay(loginUser) // 사용자 연체 내역 갱신
        const {name, userId, isAdmin, rentedBooks, createdAt} = loginUser
        res.json({
            code: 200,
            token: generateToken(loginUser),
            name, userId, isAdmin, rentedBooks, createdAt
        })
    }
}))

// 회원정보 수정
router.put('/modify', oneOf([
    validateUserName(),
    validateUserPassword()
]), isAuth, expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code: 400,
            message: 'Invaild Form data for user',
            error: errors.array()
        })
    }else{
        const user = await User.findById(req.user._id)
        if(!user){
            res.status(404).json({code: 404, message: '수정 유저 정보 없음'})
        }else{
            user.name = req.body.name || user.name
            user.password = req.body.password || user.password
            user.lastModifiedAt = new Date()
    
            const updateUser = await user.save()
            const {name, userId, isAdmin, rentedBooks, createdAt} = updateUser
            res.json({
                code: 200,
                token: generateToken(updateUser),
                name, userId, isAdmin, rentedBooks, createdAt
            })
        }
    }
}))

// 회원탈퇴 (탈퇴시 해당 회원의 대출 히스토리 모두 삭제하기)
router.delete('/del', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user._id)
    const historys = await History.deleteMany({borrowedUserId: req.user._id})
    console.log(historys)
    if(!user){
        res.status(404).json({code: 404, message: '삭제 유저 정보 없음'})
    }else{
        res.status(204).json({code: 204, message: '유저 탈퇴 완료'})
    }
}))


// 대출내역(히스토리) 조회시 또는 로그인시  대출만료 날짜와 현재날짜 비교후 대출상태가 연체인지 체크
async function renewDelay(user){
    const historys = await History.find({borrowedUserId: user._id})

    historys.forEach(async function(history){
        if(history.borrowStatus !== '연체' 
        && history.borrowStatus !== '반납'
        && !moment().isBefore(history.expiredAt)){
            history.borrowStatus = '연체'
            await history.save()
        }
    })
}


module.exports = router