const express = require('express')
const Book = require('../models/Book')
const expressAsyncHandler = require('express-async-handler')

const router = express.Router()

// 전체 도서목록 조회
router.get('/get', expressAsyncHandler(async (req, res, next) => {
    const books = await Book.find()
    if(!books){
        res.status(404).json({code: 404, message: '전체 책 조회 내역 없음'})
    }else{
        res.json(books)
    }
}))

// 특정 도서의 상세정보 조회 
router.get('/get/:bookId', expressAsyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.bookId)
    if(!book){
        res.status(404).json({code: 404, message: '도서 상세정보 조회 에러'})
    }else{
        res.json(book)
    }
}))

module.exports = router