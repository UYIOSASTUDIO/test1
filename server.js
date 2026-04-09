const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: ['https://test2-e1id.onrender.com'], // Füge hier die URL deines Frontends ein
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint to receive tracking data
app.post('/api/track', (req, res) => {
    const trackingData = req.body;

    // Format email content
    const emailContent = `
        <h2>New Tracking Data Received</h2>
        <p><strong>Tracking ID:</strong> ${trackingData.trackingId}</p>
        <p><strong>Timestamp:</strong> ${trackingData.timestamp}</p>
        <p><strong>IP Address:</strong> ${trackingData.ipAddress}</p>
        <p><strong>User Agent:</strong> ${trackingData.userAgent}</p>
        <p><strong>Language:</strong> ${trackingData.language}</p>
        <p><strong>Platform:</strong> ${trackingData.platform}</p>
        <p><strong>Screen Resolution:</strong> ${trackingData.screenResolution}</p>
        <p><strong>Color Depth:</strong> ${trackingData.colorDepth}</p>
        <p><strong>Timezone:</strong> ${trackingData.timezone}</p>
        
        ${trackingData.location ? `
        <h3>Location Data:</h3>
        <p><strong>Latitude:</strong> ${trackingData.location.latitude}</p>
        <p><strong>Longitude:</strong> ${trackingData.location.longitude}</p>
        <p><strong>Accuracy:</strong> ${trackingData.location.accuracy} meters</p>
        ` : ''}
        
        ${trackingData.locationError ? `<p><strong>Location Error:</strong> ${trackingData.locationError}</p>` : ''}
        ${trackingData.locationDenied ? '<p><strong>Location Access:</strong> Denied by user</p>' : ''}
        ${trackingData.locationNotSupported ? '<p><strong>Location Access:</strong> Not supported by browser</p>' : ''}
    `;

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `New Tracking Data: ${trackingData.trackingId}`,
        html: emailContent
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send tracking data' });
        }

        console.log('Email sent:', info.response);
        res.status(200).json({ success: true, message: 'Tracking data received and email sent' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});