const express = require('express') // importando o express para o projeto jobify
const app = express() // criando um novo express para o projeto será usando como função
const bodyParser = require('body-parser') // serve para pegar os dados do formulário e colocar no banco de dados
const sqlite = require('sqlite') // importando banco de dados
const dbConnection = sqlite.open('banco.sqlite', {Promise})

app.set('view engine', 'ejs') // para separar JS do HTML

app.use(express.static('public')) // para quando for requerido algo diferente '/'
app.use(bodyParser.urlencoded({ extended: true}))
app.get('/', async(request, response) => { // receber uma requisição('/') e responder.
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;') //listando as categorias nas  páginas
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat, // espalhando o conteúdo do banco de dados em um objeto
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)//vinculando vaga com categoria
        }
    })
    response.render('home', {
        categorias
    })
 }) 
    
app.get('/vaga/:id', async(request, response) => { // receber uma requisição('/vaga') e responder.
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' +request.params.id)
      response.render('vaga', {
          vaga
      }) //respondendo a requisição com uma página HTML
})
app.get('/admin', (req, res) => { // criando página de administrador
    res.render('admin/home')
})
app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', { vagas })
})
app.get('/admin/vagas/delete/:id', async(req, res) => { // página para apagar uma vaga
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id)
    res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})
app.post('/admin/vagas/nova', async(req, res) => { // pegar os dados da nova vaga e colocar no banco de dados
    const { titulo, descrição, categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descrição) values('${categoria}', '${titulo}', '${descrição}') `)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})

app.post('/admin/vagas/editar/:id', async(req, res) => { // pegar os dados da nova vaga e colocar no banco de dados
    const { titulo, descrição, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descrição = '${descrição}' where id = ${id}`)
    res.redirect('/admin/vagas')
})

// ----------------   CATEGORIAS CONFIGURAÇÕES   -------------

app.get('/admin/categoria', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categoria', { categorias })
})
app.get('/admin/categoria/delete/:id', async(req, res) => { // página para apagar uma vaga
    const db = await dbConnection
    await db.run('delete from categorias where id = '+req.params.id)
    res.redirect('/admin/categoria')
})

app.get('/admin/categoria/nova', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria', { categorias })
})

app.post('/admin/categoria/nova', async(req, res) => { // pegar os dados da nova categoria e colocar no banco de dados
    const { categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values('${categoria}') `)
    res.redirect('/admin/categoria')
})

app.get('/admin/categoria/editar/:id', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const categoria = await db.get('select * from categorias where id = '+req.params.id)
    res.render('admin/editar-categoria', { categorias, categoria })
})

app.post('/admin/categoria/editar/:id', async(req, res) => { // pegar os dados da nova vaga e colocar no banco de dados
    const { categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categoria')
})

const init = async() => { // função para fazer o banco de dados rodar
    const db = await dbConnection
        /*await db.run('create table if not exists categorias(id INTEGER PRIMARY KEY, categoria TEXT);')
        await db.run('create table if not exists vagas(id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descrição TEXT);')
        const categoria = 'FullStack Team' 
        const vaga = 'FullStack Developer (Remote)'
        const descrição = 'Vagas destinadas para quem fez o FullStack Lab'
        await db.run(`insert into categorias(categoria) values('${categoria}') `)
        await db.run(`insert into vagas(categoria, titulo, descrição) values(1, '${vaga}', '${descrição}') `) */
}

init()
app.listen(3000, (err) => {  // serve para rodar a aplicação
    if(err) {
        console.log('Não foi possível iniciar o servidor do Jobify!')
    }else{
        console.log('Servidor do Jobify Funcionando!!')
    }
})