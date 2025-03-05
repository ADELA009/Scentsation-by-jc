require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/scentsation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Product Schema and Model
const productSchema = new mongoose.Schema({
    id: String,
    name: String,
    price: Number,
    image: String,
    description: String,
    availableQuantity: Number
});
const Product = mongoose.model('Product', productSchema);

// Define Cart Item Schema
const cartItemSchema = new mongoose.Schema({
    productId: String,
    quantity: Number
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

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

// API Endpoints
// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific product
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a product to the cart
app.post('/cart/add', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.availableQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        // Update product quantity
        product.availableQuantity -= quantity;
        await product.save();

        // Add item to cart
        const cartItem = new CartItem({
            productId: productId,
            quantity: quantity
        });

        await cartItem.save();

        res.status(201).json({ message: 'Product added to cart' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove a product from the cart
app.delete('/cart/remove/:productId', async (req, res) => {
    try {
        const cartItem = await CartItem.findOne({ productId: req.params.productId });
        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Restore product quantity
        const product = await Product.findOne({ id: req.params.productId });
        product.availableQuantity += cartItem.quantity;
        await product.save();

        await CartItem.deleteOne({ productId: req.params.productId });

        res.json({ message: 'Product removed from cart' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get cart items
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await CartItem.find();
        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
