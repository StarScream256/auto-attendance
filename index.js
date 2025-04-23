import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv'
import { getTodayCourse, getAllCourse } from './src/courseHandler.js'
import { makeAttendance } from './src/bot.js'

const app = express()
const PORT = process.env.APP_PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const now = new Date();
const time = now.toTimeString().split(' ')[0]

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    res.render('index', {
        title: 'Main',
        time: now,
        dayName: days[now.getDay()],
        type: req.query.type || 'today',
        allCourses: getAllCourse(process.env.SEMESTER),
        todayCourses: getTodayCourse(process.env.SEMESTER, now.getDay())
    })
})

app.post('/attend', async (req, res) => {
    const { courseId, attendance } = req.body
    console.log(courseId, attendance)

    let attendanceState
    try {
        attendanceState = await makeAttendance(courseId, attendance)
        res.status(200).json(attendanceState)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            login: false,
            attend: false,
            logout: false
        })
    }
})

app.listen(PORT, () => {
    console.log(`[ ${time} ] App running at http://localhost:${PORT}`)
})