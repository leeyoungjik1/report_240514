const express = require('express')
const Book = require('../models/Book')
const {isAuth, isAdmin} = require('../../auth')
const expressAsyncHandler = require('express-async-handler')
const { validationResult, oneOf } = require('express-validator')
const { validateBookRelease, validateBookCategory } = require('../../validator')

const router = express.Router()

// 신간도서 추가 (추가하기 전 bookId으로 중복체크)
router.post('/register', [
    validateBookRelease(),
    validateBookCategory()
], isAuth, isAdmin, expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({ 
            code: 400, 
            message: 'Invalid Form data for book',
            error: errors.array()
        })
    }else{
        const book = new Book({
            bookId: req.body.bookId,
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            release: req.body.release,
            author: req.body.author
        })
        const newBook = await book.save()
        if(!newBook){
            res.status(400).json({code: 400, message: '책 등록 정보 에러'})
        }else{
            const {bookId, title, category, description, release, author, createdAt} = newBook
            res.json({
                code: 200,
                bookId, title, category, description, release, author, createdAt
            })
        }
    }
}))

// 기존도서 정보 변경
router.put('/:id', [
    // title만 수정할 수 없는 오류 발생
    // validateBookRelease(),
    // validateBookCategory()
], isAuth, isAdmin, expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({ 
            code: 400, 
            message: 'Invalid Form data for book',
            error: errors.array()
        })
    }else{
        const book = await Book.findById(req.params.id)
        if(!book){
            res.status(404).json({code: 404, message: '수정 책 정보 없음'})
        }else{
            book.title = req.body.title || book.title
            book.category = req.body.category || book.category
            book.description = req.body.description || book.description
            book.release = req.body.release || book.release
            book.author = req.body.author || book.author
            book.lastModifiedAt = new Date()
    
            const updatedBook = await book.save()
            const {bookId, title, category, description, release, author, createdAt} = updatedBook
            res.json({
                code: 200,
                bookId, title, category, description, release, author, createdAt
            })
        }
    }
}))
router.get('/get', isAuth, isAdmin, expressAsyncHandler(async (req, res, next) => {
    const books = await Book.find()
    if(!books){
        res.status(404).json({code: 404, message: '전체 책 조회 내역 없음'})
    }else{
        res.json(books)
    }
}))

// 기존도서 삭제
router.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res, next) => {
    const book = await Book.findByIdAndDelete(req.params.id)
    if(!book){
        res.status(404).json({code: 404, message: '삭제 책 정보 없음'})
    }else{
        res.status(204).json({code: 204, message: '책 삭제 완료'})
    }
}))


// 그래프, 관리자 통계 API 추가
router.get('/group/:field', isAuth, isAdmin, expressAsyncHandler(async (req, res, next) => {
    if(req.params.field === 'category'){
        const docs = await Book.aggregate([
            {
                $group: {
                    _id: `$${req.params.field}`,
                    count: { $sum: 1 }
                }
            },
            { 
                $sort: {_id: 1}
            }
        ])
        console.log(`Number Of Group: ${docs.length}`)
        res.json({code: 200, docs})
    }else{
        res.status(400).json({code: 400, message: 'You gave wrong field to group documents'})
    }
}))


module.exports = router