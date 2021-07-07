const sgMail = require('@sendgrid/mail');
const Mailgen = require('mailgen');
const dotenv = require('dotenv');

dotenv.config();
const { SENDGRID_API_KEY, BASE_API_URL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const createEmailTemplate = (verificationToken, name = 'Guest') => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Contacts API Service',
      link: BASE_API_URL,
    },
  });

  const emailTemplate = {
    body: {
      name,
      intro:
        "Welcome to our application! We're very excited to have you on board.",
      action: {
        instructions: 'To get started with application, please click here:',
        button: {
          color: '#22BC66',
          text: 'Confirm your account',
          link: `${BASE_API_URL}/api/users/verify/${verificationToken}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  return mailGenerator.generate(emailTemplate);
};

const sendEmail = (verificationToken, email) => {
  const emailBody = createEmailTemplate(verificationToken);

  const msg = {
    to: email,
    from: 'korneyko_ns@ukr.net',
    subject: 'Contacts Api Service Account Verification',
    text: 'Hello!',
    html: emailBody,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = sendEmail;
