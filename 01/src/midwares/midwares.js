const jwt = require('jsonwebtoken')
const { pool } = require('../connection/connection')
const jwtSecret = require('../jwtSecret')

const verifyToken = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Não autorizado.' })
    }

    const token = authorization.split(' ')[1]

    try {
        const { id } = jwt.verify(token, jwtSecret)

        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1', [id])

        if (!rowCount) {
            return res.status(402).json({ mensagem: 'Usuário não encontrado' })
        }

        req.user = rows[0]

        next()

    } catch (error) {
        return res.status(401).json({ mensagem: 'Não autorizado.' })
    }
}

module.exports = {
    verifyToken
}