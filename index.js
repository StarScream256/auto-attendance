import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv'
import { getTodayCourse, getAllCourse } from './src/courseHandler.js'

const app = express()
const PORT = process.env.APP_PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const now = new Date();
const time = now.toTimeString().split(' ')[0];

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    res.render('index', {
        title: 'Main',
        time: now,
        dayName: days[now.getDay()],
        allCourses: getAllCourse(process.env.SEMESTER),
        todayCourses: getTodayCourse(process.env.SEMESTER, now.getDay())
    })
})

app.listen(PORT, () => {
    console.log(`[ ${time} ] App running at http://localhost:${PORT}`)
})