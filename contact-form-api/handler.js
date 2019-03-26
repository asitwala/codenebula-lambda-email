// handler.js

const aws = require('aws-sdk');
const ses = new aws.SES();
const customEmail = process.env.EMAIL;
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
    Source: customEmail,
    Destination: { ToAddresses: [customEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Message sent from email ${email} by ${name} \nContent: ${content}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `[CodeNebula] Message from ${name} (${email})`
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

