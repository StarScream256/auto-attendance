require('dotenv').config()
// import { links } from 'express/lib/response'
import puppeteer from 'puppeteer'
const courseUrl = require('./courseUrl')

const baseUrl = process.env.BASE_URL
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
    let logoutHref
    if (currentUrl.includes('/my')) {
        logoutHref = await page.$eval('a[data-title="logout,moodle"]', (element) => element.href)
        // console.log(logoutHref)
        // console.log(logoutHref.split('=')[1])
    }
    return {
        success: currentUrl.includes('/my'),
        sesskey: logoutHref.split('=')[1]
    }
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

const attend = async (page, courseId) => {
    const basePattern = `${baseUrl}/mod/attendance/attendance.php`
    await Promise.all([
        page.goto(courseUrl.getUrl(courseId)),
        page.waitForNavigation({ waitUntil: 'load' })
    ])
    await page.waitForSelector('a');
    let attendUrl = await page.$$eval('a', (links, pattern) => {
        const found = links.find(link =>link.getAttribute('href')?.startsWith(pattern))
        return found ? found.href : null
    }, basePattern)
    let queryParams = attendUrl.split('?')[1]
    let sessid = queryParams.split('&')[0].split('=')[1]

    await Promise.all([
        page.goto(attendUrl),
        page.waitForNavigation({ waitUntil: 'load' })
    ])

    // todo : find radio button for value 388807 -> present, or re-evaluate if dynamic
}

const closeBrowser = async (browser) => {
    await browser.close();
}

export const openBrowser = async (courseId) => {
    const browser = await puppeteer.launch({
        headless: true
    })

    const page = await browser.newPage()

    const loginState = await login(page)
    let sessionKey
    if (loginState.success) {
        sessionKey = loginState.sesskey
        console.log('Login success')
    } else {
        console.log('Login failed')
    }

    await attend(courseId)
    
    const logoutState = await logout(page, sessionKey)
    if (logoutState.success) {
        console.log('Logout success')
    } else {
        console.log('Logout failed')
    }
    
    await closeBrowser()
}
