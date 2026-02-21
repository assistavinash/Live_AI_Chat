const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function registerUser(req, res) {
    const { email, fullName :{ firstName, lastName }, password } = req.body;

    const isUserAlreadyexist = await userModel.findOne({ email });

    if(isUserAlreadyexist) {
        return res.status(400).json({ message: 'User already exists' });
    }   


const hashedPassword = await bcrypt.hash(password, 10); 
const user = await userModel.create({
    fullName: {
        firstName,
        lastName
    },
    email,
    password: hashedPassword
})

const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
res.cookie("token",token)

res.status(201).json({ message: 'User registered successfully', user:{
    email: user.email,
    _id: user._id,
    fullName: user.fullName
} });

}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if(!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set secure cookie with proper options
    res.cookie("token", token, {
        httpOnly: true,        // Prevent JS access (only HTTP/HTTPS)
        secure: false,         // Set to true in production with HTTPS
        sameSite: 'Lax',       // CSRF protection
        maxAge: 3600000        // 1 hour in milliseconds
    });

    res.status(200).json({ message: 'User logged in successfully', user:{
        email: user.email,
        _id: user._id,
        fullName: user.fullName
    } });
}

async function logoutUser(req, res) {
    // Clear the authentication token cookie using the same options as login
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,         // Set to true in production with HTTPS
        sameSite: 'Lax',
        path: '/'              // Ensure cookie is cleared from root path
    });
    
    res.status(200).json({ message: 'User logged out successfully' });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};