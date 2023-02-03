const { pool } = require("../connection/connection")



const registerPokemon = async (req, res) => {
    const { id } = req.user

    const { nome, habilidades, imagem, apelido } = req.body

    if (!nome || !habilidades) {
        return res.status(402).json({ mensagem: 'Campo nome e habilidades são obrigatórios.' })
    }

    try {
        const { rows } = await pool.query('insert into pokemons (usuario_id, nome, habilidades, imagem, apelido) values ($1, $2, $3, $4, $5) returning *', [id, nome, habilidades, imagem, apelido])

        return res.status(201).json(rows[0])
    } catch (error) {
        return res.status(402).json({ mensagem: 'Pokemon já cadastrado' })
    }
}

const updateNickname = async (req, res) => {
    const { id } = req.user
    const { nome, apelido } = req.body

    if (!nome || !apelido) {
        return res.status(402).json({ mensagem: 'Campo nome e apelido são obrigatórios.' })
    }

    try {
        const { rows, rowCount } = await pool.query(`update pokemons set apelido = $1 where nome ilike $2 and usuario_id = $3 returning *`, [apelido, nome, id])

        if (!rowCount) {
            return res.status(402).json({ mensagem: 'Pokemon não encontrado' })
        }

        return res.json(rows[0])
    } catch (error) {
        return res.status(500).json(error)
    }
}

const getPokemons = async (req, res) => {
    const { id } = req.user
    try {
        const { rows, rowCount } = await pool.query('select p.id, u.nome as usuario, p.nome, p.apelido, p.habilidades, p.imagem from usuarios u join pokemons p on u.id = p.usuario_id order by id')

        const pokes = rows.map((pokemon) => {
            let habs = pokemon.habilidades.split(',')
            pokemon.habilidades = habs.map((hab) => hab.trim())
        })

        if (!rowCount) {
            return res.json({ mensagem: 'Nenhum pokemon encontrado.' })
        }

        console.log(pokes)

        return res.json(rows)
    } catch (error) {
        return res.status(500).json(error)
    }
}

const getSiglePokemon = async (req, res) => {
    const { id } = req.params
    try {
        const { rows, rowCount } = await pool.query('select * from pokemons where id = $1', [id])

        if (!rowCount) {
            return res.status(402).json({ mensagem: 'Pokemon não encontrado' })
        }

        return res.json(rows[0])
    } catch (error) {
        return res.status(500).json(error)
    }
}

const deletePokemon = async (req, res) => {
    const { id } = req.user
    const { nome } = req.body
    try {
        const ilike = `%${nome}%`
        const { rows, rowCount } = await pool.query('delete from pokemons where usuario_id = $1 and nome ilike $2 returning *', [id, ilike])

        if (!rowCount) {
            return res.status(402).json({ mensagem: 'Pokemon não encontrado.' })
        }

        return res.json({ mensagem: "Pokemon deletado com sucesso.", pokemon: rows[0] })
    } catch (error) {
        return res.status(500).json(error)
    }
}

module.exports = {
    registerPokemon,
    updateNickname,
    getPokemons,
    getSiglePokemon,
    deletePokemon
}