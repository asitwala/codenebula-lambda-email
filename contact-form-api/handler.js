// handler.js

const aws = require('aws-sdk');
const ses = new aws.SES();
const customFromEmail = process.env.FROM_EMAIL;
const customToEmail = process.env.TO_EMAIL;
const customDomain = process.env.DOMAIN;

function createResponse (code, payload) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': customDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(payload)
  }
}

function createError (code, err) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': customDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(err.message)
  }
}

function getEmailParams (body) {
  const { email, name, content } = JSON.parse(body);
  if (!(email && name && content)) {
    throw new Error('Missing parameters! Make sure to add parameters "email", "name", and "content".')
  }

  return {
    Source: customFromEmail,
    Destination: { ToAddresses: [customToEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `You've received a new message on the Precision Lifts website!\n
            Name: ${name} \n
            Email: ${email}\n
            Message: ${content}\n`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `[Precision Lifts] Message from ${name} (${email})`
      }
    }
  }
}

module.exports.send = async (event) => {
  try {
    const emailParams = getEmailParams(event.body);
    const data = await ses.sendEmail(emailParams).promise();
    return createResponse(200, data);
  } catch (err) {
    return createError(500, err);
  }
}

