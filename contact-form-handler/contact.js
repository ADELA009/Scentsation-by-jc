const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter object using your email service credentials
    const transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'gmail', 'Outlook', etc.
        auth: {
            user: 'adeyekunadelola2009@gmail.com', // Replace with your email address
            pass: 'kovn fqkj bkeu bvxh'  // Replace with your email password or an app-specific password
        }
    });

    const mailOptions = {
        from: email,
        to: 'adeyekunadelola2009@gmail.com', // Replace with your email address
        subject: 'Contact Form Submission from Scentsation by JC',
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Oops! Something went wrong and we couldn\'t send your message.');
        } else {
            console.log('Email sent: ' + info.response);
            // Send an HTML response with the thank you message and styling
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thank You - Scentsation by JC</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background-color: #f4f4f4;
                        }
                        h1 {
                            color: #333;
                        }
                        p {
                            font-size: 1.2em;
                            color: #666;
                            margin-bottom: 20px;
                        }
                        a {
                            color: #007bff;
                            text-decoration: none;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <h1>Thank You!</h1>
                    <p>Thank you for your message. We will get back to you soon.</p>
                    <a href="/ecommerce-perfume/public/index.html">Back to Home</a>
                </body>
                </html>
            `);
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});