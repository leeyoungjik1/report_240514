const { body } = require('express-validator')

const isFieldEmpty = (field) => {
    return body(field)
            .not()
            .isEmpty() // not, isEmpty 순서 바꾸면 안됨
            .withMessage(`${field} is required`)
            .bail() // bail() 메서드 앞쪽 부분이 false 이면 더 이상 뒷쪽의 데이터검증을 안함
            .trim() // 공백 제거
}

const validateUserName = () => {
    return isFieldEmpty("name")
            .isLength({min: 2, max: 20})
            .withMessage("user name length must be between 2~20 characters")
}

const validateUserPassword = () => {
    return isFieldEmpty("password")
            .isLength({min: 7})
            .withMessage("password must be more than 7 characters")
            .bail()
            .isLength({max: 15})
            .withMessage("password must be lesser than 15 characters")
            .bail()
            .matches(/[A-Za-z]/)
            .withMessage("password must be at least 1 alphabet")
            .matches(/[0-9]/)
            .withMessage("password must be at least 1 number")
            .matches(/[!@#$%^&*]/)
            .withMessage("password must be at least 1 special character")
            .bail()
            .custom((value, {req}) => req.body.confirmPassword === value) // 입력한 비밀번호가 같은지 재확인
            .withMessage("passwords don't match")
}

const validateBookRelease = () => {
    return isFieldEmpty("release")
    .matches(/\d{4}\.\d{2}\.\d{2}/)
    .withMessage("book release form must be YYYY.MM.DD")
}
const validateBookCategory = () => {
    return isFieldEmpty("category")
    .isIn(['소설', '경제', '여행', '자기계발', '과학', '건강', 'IT'])
    .withMessage('book category must be one of 소설 | 경제 | 여행 | 자기계발 | 과학 | 건강 | IT')
}

module.exports = {
    validateUserName,
    validateUserPassword,
    validateBookRelease,
    validateBookCategory
}