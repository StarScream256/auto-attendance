import puppeteer from 'puppeteer'
import { getCourseUrl, matchingCourse } from './courseHandler.js'
import dotenv from 'dotenv'

dotenv.config()

const baseUrl = process.env.TARGET_URL
const loginUrl = `${baseUrl}/login/index.php`
const logoutUrl = `${baseUrl}/login/logout.php?sesskey=`

const login = async (page) => {
    await page.goto(loginUrl)
    await page.type('#username', process.env.USERNAME)
    await page.type('#password', process.env.PASSWORD)
    await Promise.all([
        page.click('#loginbtn'),
        page.waitForNavigation({ waitUntil: 'load' })
    ])

    const currentUrl = page.url()

    console.log(currentUrl)

    let logoutHref
    if (currentUrl.includes('/my')) {
        logoutHref = await page.$eval('a[data-title="logout,moodle"]', (element) => element.href)
    }
    if (logoutHref) {
        return {
            success: currentUrl.includes('/my'),
            sesskey: logoutHref.split('=')[1]
        }
    }
    return { success: false, sesskey: null }
}

const logout = async (page, sesskey) => {
    await Promise.all([
        page.goto(`${logoutUrl}${sesskey}`),
        page.waitForNavigation({ waitUntil: 'load' })
    ])
    const currentUrl = page.url()
    return {
        success: `${baseUrl}/` == currentUrl
    }
}

const attend = async (page, courseId, attendState) => {
    // const basePattern = `${baseUrl}/mod/attendance/attendance.php`

    let result = {
        navigateCourseUrl: false,
        attendUrlFound: false,
        navigateAttendUrl: false,
        attendSelfRecord: false
    }
    try {
        await Promise.all([
            page.goto(getCourseUrl(courseId)),
            page.waitForNavigation({ waitUntil: 'load' })
        ])
        result.navigateCourseUrl = true
    } catch (error) {
        console.log('ERROR: Failed to navigate to course URL', error)
        return result
    }

    // await page.waitForSelector('a');
    // let attendUrl = await page.$$eval('a', (links, pattern) => {
    //     const found = links.find(link =>link.getAttribute('href')?.startsWith(pattern))
    //     return found ? found.href : null
    // }, basePattern)

    const attendUrl = await page.$eval('table.generatable.attwidth.boxaligncenter a', (link) => {
        return link && link.getAttribute('href') && link.getAttribute('href') !== '' ? link.getAttribute('href') : null;
    }).catch(() => null);

    if (!attendUrl) {
        console.log(`ERROR: No attend URL found on page ${page.url()}`)
        return result
    } else {
        result.attendUrlFound = true

        console.log(`INFO: Attend URL found on page ${page.url()}`)
        console.log(attendUrl)

        let queryParams = attendUrl.split('?')[1]
        let sessid = queryParams.split('&')[0].split('=')[1]
    
        try {
            await Promise.all([
                page.goto(attendUrl),
                page.waitForNavigation({ waitUntil: 'load' })
            ])
            result.navigateAttendUrl = true
        } catch (error) {
            console.log('ERROR: Failed to navigate to attend URL', error)
            return result
        }

        // self-record attendance
        const attendanceReportUrl = `${baseUrl}/mod/attendance/view.php?id=${courseId}`
        if (page.url().includes(attendanceReportUrl)) {
            result.attendSelfRecord = true
            console.log('INFO: Attendance finished with self-record as present')
            return result
        }

        // retrieve all radio buttons
        const attendChoices = await page.$$eval('input[type="radio"]', buttons => {
            return buttons.map(button => {
                const label = button.closest('label') ? button.closest('label').innerText.trim() : null
                return { value: button.value, label: label || 'NO_LABEL', id: button.id }
            })
        })

        let correctChoice = matchingCourse(attendState, attendChoices)
        if (correctChoice == []) {
            console.log('ERROR: No label match with attendance state')
            return result
        }

        const baseLabel = await page.$(`label`)
        const correctLabel = await baseLabel.evaluate(el => el.textContext.trim().toLowerCase())
        if (correctLabel == correctChoice[0].label.toLowerCase()) {
            await baseLabel.click()

            // todo: get submit button id
        }

    }

}

const closeBrowser = async (browser) => {
    await browser.close();
}

export const makeAttendance = async (courseId, attendState) => {
    const browser = await puppeteer.launch({
        headless: true
    })

    const page = await browser.newPage()

    const loginState = await login(page)
    let sessionKey
    if (loginState.success) {
        sessionKey = loginState.sesskey
        console.log('Login success', sessionKey)
    } else {
        console.log('Login failed')
    }

    await attend(page, courseId, attendState)
    
    const logoutState = await logout(page, sessionKey)
    console.log(logoutState.success ? 'Logout success' : 'Logout failed')
    
    await closeBrowser(browser)

    return {
        login: loginState.success,
        attend: true,
        logout: logoutState.success
    }
}
