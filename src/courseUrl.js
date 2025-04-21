require('dotenv').config()

const baseUrl = process.env.BASE_URL
const baseAttendanceUrl = `${baseUrl}/mod/attendance/view.php?id=`

export const getUrl = (courseId) => {
    return `${baseAttendanceUrl}${courseId}`
}