import fs from 'fs'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

const secret = speakeasy.generateSecret({ name: 'AutoAttendance' })
const envPath = '.env'
const envContent = fs.readFileSync(envPath, 'utf8').split('\n')
const updatedEnv = envContent.map(line => 
    line.startsWith('TOTP_SECRET=') ? `TOTP_SECRET=${secret.base32}` : line
).join('\n')

fs.writeFileSync(envPath, updatedEnv)
console.log('TOTP secret added to .env')

console.log('Scan this QR code with Google Authenticator')
qrcode.toString(secret.otpauth_url, { type: 'terminal' }, (err, qr) => {
    if (err) throw err
    console.log(qr)
})
