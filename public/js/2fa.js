const twoFAForm = document.querySelector('#twoFAForm')
twoFAForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log('okeee')
    const formData = new FormData(e.target)
    const res = await fetch('/2fa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: formData.get('code'),
        })
    })

    const jsonRes = await res.json()
    console.log(jsonRes)
    window.location.href = jsonRes.redirect
})