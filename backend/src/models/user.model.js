const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    fullName: {
        firstName: {
            type: String,
            required: true 
        },
        lastName: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    },
    dailyMessageCount: {
        type: Number,
        default: 0
    },
    lastMessageReset: {
        type: Date,
        default: () => new Date()
    },
    dailyMessageLimit: {
        type: Number,
        default: 20
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;