/**
 * Send mail using template
 */
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_MAIL = "kalpeshbhad57@gmail.com";

exports.welcomeMailSend = async (email, firstName) => {
  const mailTemplate = {
    to: email,
    from: FROM_MAIL,
    templateId: "XXXXX",
    dynamicTemplateData: {
      first_name: firstName
    }
  };

  sgMail
    .send(mailTemplate)
    .then(() => {
      console.log(`Welcome Email :: ${email} :: Send`);
    })
    .catch(e => {
      console.log("Welcome Email :: Error ::", e);
    });
};

exports.emailVerificationEmailSend = async (email, firstName, link) => {
  const mailTemplate = {
    to: email,
    from: FROM_MAIL,
    templateId: "XXXXX",
    dynamicTemplateData: {
      first_name: firstName,
      link
    }
  };

  sgMail
    .send(mailTemplate)
    .then(() => {
      console.log(`Email Verification :: ${email} :: Send`);
    })
    .catch(e => {
      console.log("Email Verification :: Error ::", e);
    });
};

exports.newUserAdminEmailSend = async (email, firstName, lastName) => {
  const mailTemplate = {
    to: process.env.ADMIN_EMAIL,
    from: FROM_MAIL,
    templateId: "XXXXX",
    dynamicTemplateData: {
      first_name: firstName,
      last_name: lastName,
      email
    }
  };

  sgMail
    .send(mailTemplate)
    .then(() => {
      console.log(
        `New User Admin Email :: Admin Email :: ${process.env.ADMIN_EMAIL} :: User :: ${email} :: Send`
      );
    })
    .catch(e => {
      console.log("New User Admin Email :: Error ::", e);
    });
};

exports.forgotPasswordEmailSend = async (email, firstName, link) => {
  const mailTemplate = {
    to: email,
    from: FROM_MAIL,
    templateId: "XXXXX",
    dynamicTemplateData: {
      first_name: firstName,
      link
    }
  };
  // console.log(link);
  sgMail
    .send(mailTemplate)
    .then(() => {
      console.log(`Forgot Password Email :: ${email} :: Send`);
    })
    .catch(e => {
      console.log("Forgot Password Email :: Error ::", e);
    });
};
