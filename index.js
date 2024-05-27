require('dotenv').config()
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const app = express()
const port = 3000

//Preparamos as informacoes de acesso ao banco de dados
const dburl = process.env.DATABASE_URL
const dbname = `projeto-e-arquitetura-mvc`

//Declaramos a funcao main()
async function main() {

  //realizamos a conexao com o banco de dados
  const client = new MongoClient(dburl)
  console.log(`Conectando ao banco de dados...`)
  await client.connect()
  console.log(`Banco de dados conectado com sucesso!`)

  const db = client.db(dbname)
  const collection = db.collection(`personagem`)

  app.get('/', (req, res) => {
    res.send('Hello World!!')
  })

  const lista = ['Java', 'Ketlin', 'Android']

  //read all get (personagem)

  app.get('/personagem', async function (req, res) {
    //Acessamos a lista de itens no colection no mongodb
    const itens = await collection.find().toArray()

    //enviamos a lista de itens com resultado http://localhost:3000/personagem/66508874a2bba6eadd459e4e

    res.send(itens)
  })

  //Endpoint Read by id [GET] /personagem/id

  app.get(`/personagem/:id`, async function (req, res) {
    const id = req.params.id

    //Acesso item na collection usando id -1
    const item = await collection.findOne({_id: new ObjectId(id)})

    //Checamos se o item existe
    if (!item) {
      return res.status(404).send('Item não encontrado')
    }
    res.send(item)
  })

  //Sinalizo para express que estamos usando json no body
  app.use(express.json())

  //endpoint create [POST] /personagem
  app.post(`/personagem`, async function (req, res) {

    //acessamos o body da requisicao
    const novoItem = req.body
    
    //Checar se o nome esta presente no body
    if (!novoItem || !novoItem.nome) {
      return res.status(400).send(`Corpo da requisicao deve estar presente no body`)
    }
    //Checar se o novo item esta presente ou nao
    // if (lista.includes(novoItem)) {
    //   return res.status(409).send(`Esse item ja existe na lista`)
    // }

    //Adicionamos na lista
    await collection.insertOne(novoItem)

    res.status(201).send(novoItem)
  })

  //endpoint update[put] /personagem/:id
  app.put('/personagem/:id', async function (req, res) {
    //acessa o id dos parametros de rota
    const id = req.params.id
    
    //Checamos se o item do id -1 esta na lista exisbe mensagem caso nao esteja
    // if (!lista[id - 1]) {
    //   return res.status(404).send('Item não encontrado')
    // }
    
    //Acessamos o body da requisicao
    const NovoItem = req.body

    //Checar se o nome esta presente no body
    if (!NovoItem || !NovoItem.nome) {
      return res.status(400).send(`Corpo da requisicao deve estar presente no body`)
    }

    //Atualizamos no collection o NovoItem pelo id
    await collection.updateOne(
      {_id: new ObjectId(id)},
      {$set: NovoItem}
    )
    //Checar se o novo item esta presente ou nao
    if (lista.includes(NovoItem)) {
      return res.status(409).send(NovoItem)
    }

    res.status(201).send(NovoItem)
  })

  //endpoint delete[put] /personagem/:id
  app.delete('/personagem/:id',async function (req, res) {
    //Acessando parametros de rota
    const id = req.params.id
    //Checamos se o item do id -1 esta na lista exisbe mensagem caso nao esteja
    // if (!lista[id - 1]) {
    //   return res.status(404).send('Item não encontrado')
    // }

    //Remover itenm da lista usando o id
    await collection.deleteOne({_id: new ObjectId(id)})
    res.send(`Item removido com sucesso: ` + id)
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
//Executamos a funcao main()
main()