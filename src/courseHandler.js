import dotenv from 'dotenv'
import courses from './courseId.json' assert { type: 'json' }

dotenv.config()

const baseUrl = process.env.TARGET_URL
const baseAttendanceUrl = `${baseUrl}/mod/attendance/view.php?id=`

export const getCourseUrl = (courseId) => {
    return `${baseAttendanceUrl}${courseId}`
}

export const getAllCourse = (semester) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return Object.entries(courses[semester])
        .sort(([, a], [, b]) => {
            return a.day.localeCompare(b.day)
        })
        .map(([key, value]) => {
            return [key, {
                ...value,
                day: days[value.day] || value.day
            }]
        })
}

export const getTodayCourse = (semester, currentDay) => {
    return Object.entries(courses[String(semester)])
        .filter(([key, value]) => 
            value.day == String(currentDay)
        )
        .sort(([, a], [, b]) => {
            return a.time.localeCompare(b.time)
    })
}