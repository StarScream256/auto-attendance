import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index', { title: 'Main' })
})

const now = new Date();
const time = now.toTimeString().split(' ')[0];
app.listen(port, () => {
    console.log(`[ ${time} ] App running at http://localhost:${port}`)
})