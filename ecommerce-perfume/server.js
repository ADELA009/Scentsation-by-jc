const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'adeyekunadelola2009@gmail.com', // Replace with your email
            pass: 'ddpp geur thgw foww'   // Replace with your email password
        }
    });

    // Setup email data
    const mailOptions = {
        from: email,
        to: 'adeyekunadelola2009@gmail.com', // Replace with your email
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to send message. Please try again.' });
        }
        res.status(200).json({ message: 'Message sent successfully!' });
    });
});

// Order endpoint
app.post('/api/orders', async (req, res) => {
    const { name, location, email, cart, reference } = req.body;

    try {
        // Send order confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Order Confirmation - Scentsation by JC',
            text: `Thank you for your order, ${name}! Your order will be ready for pickup at our ${location} location. Your payment reference is ${reference}.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Failed to send confirmation email.');
            }
            res.status(200).send('Order placed successfully.');
        });
    } catch (error) {
        res.status(400).send(`Failed to place order: ${error.message}`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
