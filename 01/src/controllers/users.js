const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJWT = require('../jwtSecret')
const { pool } = require('../connection/connection')


const registerUser = async (req, res) => {
    const { nome, email, senha } = req.body
    if (!nome || !email || !senha) {
        return res.status(402).json({ mensagem: "Todos os campos são obrigatórios" })
    }

    try {
        const cryptPassword = await bcrypt.hash(senha, 10)
        const { rows } = await pool.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *', [nome, email, cryptPassword])

        return res.status(201).json(rows[0])
    } catch (error) {
        return res.status(500).json(error.detail)
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(402).json({ mensagem: 'E-mail e senha são obrigatórios' })
    }

    try {
        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])

        if (!rowCount) {
            return res.status(402).json({ mensagem: 'Usuário ou senha inválido' })
        }

        const validPassword = await bcrypt.compare(senha, rows[0].senha)

        if (!validPassword) {
            return res.status(402).json({ mensagem: 'Usuário ou senha inválido' })
        }
        const token = jwt.sign({ id: rows[0].id }, senhaJWT, { expiresIn: '8h' })
        const { senha: _, ...user } = rows[0]
        console.log(token)
        return res.json({ mensagem: 'Login realizado com sucesso', user })
    } catch (error) {
        return res.status(500).json(error)
    }
}


module.exports = {
    registerUser,
    login,
}