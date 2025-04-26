import dotenv from 'dotenv'
import courses from './courseId.json' with { type: 'json' }

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

export const matchingCourse = (attendState, attendChoices) => {
    attendState = attendState.toLowerCase()
    attendChoices = attendChoices.map(choice => {
        choice.label = choice.label.toLowerCase()
        return choice
    })

    if (attendState == 'present') {
        return attendChoices.filter(choice => 
            choice.label.includes('present') 
                || choice.label.includes('hadir')
        )
    } else if (attendState == 'late') {
        return attendChoices.filter(choice => 
            choice.label.includes('late')
                || choice.label.includes('lambat') // 'terlambat', 'lambat' (ID)
        )
    } else if (attendState == 'excused') {
        return attendChoices.filter(choice => 
            choice.label.includes('excuse') // 'excuse', 'excused', 'excuses' (EN)
                || choice.label.includes('bebas')
                || choice.label.includes('izin')
                || choice.label.includes('alasan')
        )
    } else if (attendState == 'absent') {
        return attendChoices.filter(choice => 
            choice.label.includes('absen') // 'absent' (EN) and 'absen' (ID)
                || choice.label.includes('tidak')
                || choice.label.includes('tidak hadir')
        )
    }

    return []
}
