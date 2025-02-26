require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Endpoint to get Paystack public key
app.get('/api/paystack-key', (req, res) => {
    res.json({ key: process.env.PAYSTACK_PUBLIC_KEY });
});

// Email endpoint
app.post('/api/send-email', (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: 'New Message from Contact Form',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send message. Please try again.' });
        }
        res.status(200).json({ message: 'Message sent successfully!' });
    });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Received message from ${name} (${email}): ${message}`);
    res.json({ success: true, message: 'Message sent successfully!' });
});

// Payment endpoint
app.post('/api/place-order', async (req, res) => {
    const { name, email, cart, deliveryFee, totalPrice } = req.body;
    const amount = totalPrice * 100; // Amount in kobo

    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount,
            metadata: {
                custom_fields: [
                    { display_name: "Name", variable_name: "name", value: name },
                    { display_name: "Delivery Fee", variable_name: "delivery_fee", value: deliveryFee }
                ]
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.status) {
            res.status(200).json({ success: true, paymentUrl: response.data.data.authorization_url });
        } else {
            res.status(500).json({ success: false, message: 'Failed to initialize payment. Please try again.' });
        }
    } catch (error) {
        console.error('Error initializing payment:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize payment. Please try again.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
