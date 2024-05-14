const config = require('./config')
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        isAdmin: user.isAdmin,
        rentedBooks: user.rentedBooks,
        createdAt: user.createdAt
    },
    config.JWT_SECRET,
    {expiresIn: '1d'}
    )
}

const isAuth = (req, res, next) => {
    const bearerToken = req.headers.authorization
    if(!bearerToken){
        res.status(401).json({code: 401, message: '토큰이 입력되지 않음'})
    }else{
        const token = bearerToken.slice(7, bearerToken.length)
        jwt.verify(token, config.JWT_SECRET, (err, userInfo) => {
            if(err && err.name === 'TokenExpiredError'){
                return res.status(419).json({code: 419, message: '토큰 기간 만료'})
            }else if(err){
                return res.status(401).json({code: 401, message: '토큰 에러'})
            }
            req.user = userInfo
            next()
        })
    }
}

const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next()
    }else{
        res.status(401).json({code: 401, message: '관리자가 아님'})
    }
}

module.exports = {
    generateToken,
    isAuth,
    isAdmin
}