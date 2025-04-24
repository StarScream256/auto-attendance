const loginForm = document.querySelector('#loginForm')

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const res = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: formData.get('username'),
            password: formData.get('password')
        })
    })

    const jsonRes = await res.json()
    window.location.href = jsonRes.redirect
})