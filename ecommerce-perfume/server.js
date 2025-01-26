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
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send message. Please try again.' });
        }
        res.status(200).json({ message: 'Message sent successfully!' });
    });
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
                user: 'adeyekunadelola2009@gmail.com', // Replace with your email
                pass: 'ddpp geur thgw foww'   // Replace with your email password
            }
        });

        const itemsDetails = cart.map(item => {
            return `${item.name} (x${item.quantity}) - ₦${item.price.toFixed(2)}`;
        }).join('\n');

        const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

        const mailOptions = {
            from: 'adeyekunadelola2009@gmail.com', // Replace with your email
            to: email,
            subject: 'Order Confirmation',
            text: `Thank you for your order, ${name}!\n\nOrder Details:\nReference: ${reference}\nLocation: ${location}\nDate: ${date}\n\nItems:\n${itemsDetails}\n\nTotal Amount: ₦${totalAmount}`
        };

        const adminMailOptions = {
            from: 'adeyekunadelola2009@gmail.com', // Replace with your email
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
