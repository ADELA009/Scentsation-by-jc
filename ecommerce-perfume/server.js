const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

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
            user: process.env.EMAIL_USER, // Use environment variables for sensitive data
            pass: process.env.EMAIL_PASS  // Use environment variables for sensitive data
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
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send message. Please try again.' });
        }
        res.status(200).json({ message: 'Message sent successfully!' });
    });
});

// Payment endpoint
app.post('/api/pay', async (req, res) => {
    const { name, email, cart } = req.body;
    const amount = cart.reduce((total, item) => total + item.price * item.quantity, 0) * 100; // Amount in kobo

    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount,
            metadata: {
                custom_fields: [
                    { display_name: "Name", variable_name: "name", value: name }
                ]
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` // Use environment variables for sensitive data
            }
        });

        if (response.data.status) {
            res.json({ status: 'success', paymentUrl: response.data.data.authorization_url });
        } else {
            console.error('Error initiating payment:', response.data.message);
            res.json({ status: 'error', message: 'Failed to initiate payment' });
        }
    } catch (error) {
        console.error('Error initiating payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'Failed to initiate payment' });
    }
});

// Order endpoint
app.post('/api/orders', async (req, res) => {
    const { name, location, email, cart, reference } = req.body;
    const date = new Date().toLocaleString();

    try {
        // Send order confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables for sensitive data
                pass: process.env.EMAIL_PASS  // Use environment variables for sensitive data
            }
        });

        const itemsDetails = cart.map(item => {
            return `${item.name} (x${item.quantity}) - ₦${item.price.toFixed(2)}`;
        }).join('\n');

        const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

        const mailOptions = {
            from: process.env.EMAIL_USER, // Use environment variables for sensitive data
            to: email,
            subject: 'Order Confirmation',
            text: `Thank you for your order, ${name}!\n\nOrder Details:\nReference: ${reference}\nLocation: ${location}\nDate: ${date}\n\nItems:\n${itemsDetails}\n\nTotal Amount: ₦${totalAmount}`
        };

        const adminMailOptions = {
            from: process.env.EMAIL_USER, // Use environment variables for sensitive data
            to: 'adeyekunadelola2009@gmail.com', // Replace with your email
            subject: 'New Order Received',
            text: `A new order has been placed by ${name}.\n\nOrder Details:\nReference: ${reference}\nLocation: ${location}\nDate: ${date}\n\nItems:\n${itemsDetails}\n\nTotal Amount: ₦${totalAmount}`
        };

        await transporter.sendMail(mailOptions);
        await transporter.sendMail(adminMailOptions);

        res.status(200).send('Order placed successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(400).send(`Failed to place order: ${error.message}`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
