const express = require('express')
const { registerPokemon, updateNickname, getPokemons, deletePokemon, getSiglePokemon } = require('./controllers/pokemons')
const { registerUser, login } = require('./controllers/users')
const { verifyToken } = require('./midwares/midwares')

const routes = express()

routes.post('/usuarios', registerUser)
routes.post('/login', login)

routes.use(verifyToken)

routes.post('/pokemons', registerPokemon)
routes.patch('/pokemons/atualizar', updateNickname)
routes.get('/pokemons', getPokemons)
routes.get('/pokemons/:id', getSiglePokemon)
routes.delete('/pokemons', deletePokemon)

module.exports = routes