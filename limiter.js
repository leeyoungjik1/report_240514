const expressRateLimin = require('express-rate-limit')

const limitUsage = expressRateLimin({
    windowMs: 1000, // 1초
    max: 100000, // 초당 최대사용 횟수, 더미데이터 생성을 위한 제한 해제
    handler(req, res){
        res.status(429).json({
            code: 429,
            message: 'You can use this service 1 times per second'
        })
    }
})

module.exports = {
    limitUsage
}