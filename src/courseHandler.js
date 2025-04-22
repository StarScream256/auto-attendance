import dotenv from 'dotenv'
import courses from './courseId.json' assert { type: 'json' }

dotenv.config()

const baseUrl = process.env.BASE_URL
const baseAttendanceUrl = `${baseUrl}/mod/attendance/view.php?id=`

export const getUrl = (courseId) => {
    return `${baseAttendanceUrl}${courseId}`
}

export const getAllCourse = (semester) => {
    return courses[semester]
}

export const getTodayCourse = (semester, currentDay) => {
    return Object.fromEntries(
        Object.entries(courses[String(semester)])
        .filter(([key, value]) => 
            value.day == String(currentDay)
        )
    )
}