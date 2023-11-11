import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (you should replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect('mongodb+srv://clpope:Quacksc0ped!@cluster0.doek1sv.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// // Define mongoose schemas and models
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  username: {type: String, required: true},
  password: {type: String, required: true},
  ID: {type: Number, required: true}, 
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoriteFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  currentPost: {type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
});

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  eventTime: Date,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location: {lat: Number, long: Number},
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

// API endpoint to create a user
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log('Server is running on port ${port}');
})
