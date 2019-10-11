const sgMail = require('@sendgrid/mail')
const sendGridAPIkey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIkey)

const sendWelcomeEmail = (email, name) => {
  console.log('sending welcome mail')
  sgMail.send({
    to: email,
    from: 'leslieokoduwa@gmail.com',
    subject: 'Welcome To Task App',
    text: `${name} Thank you for registering with the task app, for further enquiries call 01-1231223 or visit task-app@support.com`
  })
}

const sendGoodbyeMail = (email, name) => {
  console.log('sending goodbye mail')
  sgMail.send({
    to: email,
    from: 'leslieokoduwa@gmail.com',
    subject: 'Like WtF! Bro! which kain life!!',
    text: `Why you dey do anyhow na, why you go close account, which kain nonsense be this!, you no no say na hustle we dey! ehn ${name}`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeMail
}

