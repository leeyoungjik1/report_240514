const express = require('express')
const Book = require('../models/Book')
const User = require('../models/User')
const History = require('../models/History')
const {isAuth, generateToken} = require('../../auth')
const expressAsyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const { Types: { ObjectId }} = mongoose
const moment = require('moment')


const router = express.Router()

// 대출한 도서목록 조회
router.get('/borrow', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if(!user){
        res.status(404).json({code: 404, message: '대출 도서 조회 유저 정보 없음'})
    }else{
        if(user.rentedBooks.length === 0){
            res.status(404).json({code: 404, message: '대출 도서 없음'})
        }else{
            const books = []
            for(let i=0; i<user.rentedBooks.length; i++){
                const book = await Book.findById(user.rentedBooks[i])
                books.push(book)
            }
            res.json({code: 200, rentedBooks: books})
        }
    }
}))

// 대출한 도서의 상세정보 조회
router.get('/borrow/:bookId', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const searchedBook = user.rentedBooks.find(bookId => {
        return bookId.toString() === req.params.bookId
    })

    if(!searchedBook){
        res.status(404).json({code: 404, message: '사용자 대출 도서 상세정보 조회 에러'})
    }else{
        const book = await Book.findById(searchedBook)
        res.json(book)
    }
}))

// 도서대출 (대출하기 전 bookId으로 중복체크) (도서 대출시 대출만료기한을 2주 정도로 자동설정)
// 사용자 연체 내역 존재 시 대출 불가
// 대출내역(히스토리) 추가(생성)
router.post('/borrow/:bookId', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    // 사용자 연체 내역 갱신은 로그인 시
    const delayedHistory = await History.findOne({borrowedUserId: user._id, borrowStatus: '연체'})
    if(delayedHistory){
        res.status(400).json({code: 400, message: '사용자 연체 내역 존재'})
    }else{
        const book = await Book.findById(req.params.bookId)
        if(!book){
            res.status(404).json({code: 404, message: '대출할 도서 조회 에러'})
        }else{
            if(user.rentedBooks.length > 0 && user.rentedBooks.find(bookId => bookId.toString() === book._id.toString())){
                res.status(404).json({code: 404, message: '대출할 도서 중복 에러'})
            }else{
                user.rentedBooks.push(book._id)
                const history = new History({
                    borrowedBookId: book._id,
                    borrowedUserId: user._id,
                    // expiredAt: new Date().setDate(new Date().getDate()+14)
                    expiredAt: moment().add(14, 'days')
                })
                const rentedBookUser = await user.save()
                const newHistory = await history.save()
                const {name, userId, isAdmin, rentedBooks, lastModifiedAt} = rentedBookUser
    
                res.json({
                    code: 200,
                    token: generateToken(rentedBookUser),
                    name, userId, isAdmin, rentedBooks, lastModifiedAt, newHistory
                })
            }
        }
    }
}))

// 도서반납
// 대출내역(히스토리) 업데이트 (대출 상태, 반납시각)
router.delete('/borrow/:bookId', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const searchedBook = user.rentedBooks.find(bookId => {
        return bookId.toString() === req.params.bookId
    })

    if(!searchedBook){
        res.status(404).json({code: 404, message: '사용자 반납할 대출 도서 조회 에러'})
    }else{
        const deletedBook = user.rentedBooks.filter(bookId => {
            return bookId.toString() !== req.params.bookId
        })
        user.rentedBooks = deletedBook
        const history = await History.findOne({borrowedBookId: searchedBook, borrowedUserId: user._id, borrowStatus: {$in: ['대출', '연장', '연체']}})
        if(!history){
            res.status(404).json({code: 404, message: 'history에 반납할 대출 내역 없음'})
        }else{
            history.borrowStatus = '반납'
            history.returnedAt = new Date()
    
            const updatedHistory = await history.save()
            const deletedBookUser = await user.save()
            const {name, userId, isAdmin, rentedBooks, lastModifiedAt} = deletedBookUser    

            res.json({
                code: 200,
                token: generateToken(deletedBookUser),
                name, userId, isAdmin, rentedBooks, lastModifiedAt, updatedHistory
            })
        }
    }
}))

// 대출내역(히스토리) 조회 
router.get('/history', isAuth, expressAsyncHandler(async (req, res, next) => {
    const historys = await History.find({borrowedUserId: req.user._id}).populate('borrowedUserId', ['name', 'userId']).populate('borrowedBookId', ['bookId', 'title'])
    if(historys.length === 0){
        res.status(404).json({code: 404, message: '사용자 대출 내역 없음'})
    }else{
        historys.forEach(async function(history){
            if(history.borrowStatus !== '연체' 
            && history.borrowStatus !== '반납'
            && !moment().isBefore(history.expiredAt)){
                history.borrowStatus = '연체'
                await history.save()
            }
        })
        res.json({code: 200, historys})
    }
}))
// 반납할때 유저 rentedBooks 배열에서 빼야함
// router.put('/history/return/:historyId', isAuth, expressAsyncHandler(async (req, res, next) => {
//     const history = await History.findOne({borrowedUserId: req.user._id, _id: req.params.historyId})
//     if(!history){
//         res.status(404).json({code: 404, message: '반납할 대출 내역 없음'})
//     }else{
//         if(history.borrowStatus === '반납'){
//             res.status(401).json({code: 401, message: '이미 반납이 완료된 도서'})
//         }else{
//             history.borrowStatus = '반납'
//             history.returnedAt = new Date()
    
//             const updatedHistory = await history.save()
//             res.json({
//                 code: 200,
//                 updatedHistory
//             })
//         }
//     }
// }))

// 대출한 도서의 연장 (일주일)
router.put('/history/extend/:historyId', isAuth, expressAsyncHandler(async (req, res, next) => {
    const history = await History.findOne({borrowedUserId: req.user._id, _id: req.params.historyId})
    if(!history){
        res.status(404).json({code: 404, message: '연장할 대출 내역 없음'})
    }else{
        if(history.borrowStatus === '반납'){
            res.status(401).json({code: 401, message: '이미 반납이 완료된 도서'})
        }else{
            const dxpiredDate = moment(history.expiredAt)
            history.borrowStatus = '연장'
            history.expiredAt = dxpiredDate.add(7, 'days')
            
            const updatedHistory = await history.save()
            res.json({
                code: 200,
                updatedHistory
            })
        }
    }
}))




// 그래프, 회원 통계 API 추가
router.get('/group/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(req.params.field === 'category'){
        const historys = await History.aggregate([
            {
                $match: {borrowedUserId: new ObjectId(req.user._id)}
            },
            {
                $project: {borrowedBookId: 1}
            }
        ])
        const bookIds = historys.map(({borrowedBookId}) => borrowedBookId)
        const docs = await Book.aggregate([
            {
                $match: {_id: {$in: bookIds}}
            },
            {
                $group: {
                    _id: `$${req.params.field}`,
                    count: {$sum: 1}
                }
            },
        ])
        console.log(`Number Of Group: ${docs.length}`)
        res.json({code: 200, docs})
    }else{
        res.status(400).json({code: 400, message: 'You gave wrong field to group documents'})
    }
}))



module.exports = router