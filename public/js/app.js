const openPromptBtns = document.querySelectorAll('#openPrompt')
const closePromptBtn = document.querySelector('#closePrompt')
const promptForm = document.querySelector('#promptForm')
const promptBg = document.querySelector('#promptBg')

openPromptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        promptBg.classList.remove('hidden')
        document.body.style.overflow = 'hidden'
        const courseId = btn.getAttribute('courseId')
        const inputCourseId = document.querySelector('#hiddenCourseId')
        inputCourseId.value = courseId
    })
})

closePromptBtn.addEventListener('click', () => {
    promptBg.classList.add('hidden')
    document.body.style.overflow = ''
})

promptForm.addEventListener('submit', async (element) => {
    element.preventDefault()

    const confirmText = document.querySelector('#confirmText')
    const loadingConfirm = document.querySelector('#loadingConfirm')

    confirmText.classList.add('hidden')
    loadingConfirm.classList.remove('hidden')

    const formData = new FormData(element.target)
    const courseId = formData.get('courseId')
    const attendance = formData.get('attendance')

    const res = await fetch('/attend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: courseId, attendance: attendance })
    })

    const data = await res.json()
    const msg = [
        `Status: ${res.status}`,
        `Login: ${data.login}`,
        `Attend: ${data.attend}`,
        `Logout: ${data.logout}`
    ].join('\n')
    alert(msg)
    window.location.href = '/my'
})
