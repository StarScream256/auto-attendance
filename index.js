import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv'
import { getTodayCourse, getAllCourse } from './src/courseHandler.js'
import { makeAttendance } from './src/bot.js'
import session from 'express-session'
import speakeasy from 'speakeasy'

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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body
    if (username == process.env.SECRET_USERNAME && password == process.env.SECRET_PASSWORD) {
        req.session.pre2fa = true
        res.json({ redirect: '/2fa' })
    } else {
        res.json({ redirect: '/forbidden' })
    }
})

app.get('/2fa', (req, res) => {
    if (!req.session.pre2fa) return res.json({ redirect: '/forbidden' })
    res.render('2fa', { title: 'Two Factor Authentication' })
})

app.post('/2fa', (req, res) => {
    if (!req.session.pre2fa) return res.json({ redirect: '/forbidden' })
    const { code } = req.body
    const verified = speakeasy.totp.verify({
        secret: process.env.TOTP_SECRET,
        encoding: 'base32',
        token: code,
        window: 1
    })

    if (verified) {
        console.log('valid 2fa code')
        req.session.loggedIn = true
        res.json({ redirect: '/my' })
    } else {
        console.log('Invalid 2fa code')
    }
})

app.get('/my', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/forbidden')
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

app.get('/forbidden', (req, res) => {
    res.render('forbidden', { title: 'Forbidden' })
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
})

app.listen(PORT, () => {
    console.log(`[ ${time} ] App running at http://localhost:${PORT}`)
})