import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt'

const app = express();
const port = process.env.PORT || 3000;
const SALT_WORK_FACTOR = 10;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (you should replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect('mongodb+srv://clpope:Quacksc0ped!@cluster0.doek1sv.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define mongoose schemas and models
const UserSchema = new mongoose.Schema({
    phoneNumber: String,
    username: String,
    password: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ///favoriteFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    currentPost: {type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  });

UserSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) return next(err);

          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

UserSchema.methods.comparePassword = (candidatePassword) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return err;
    return isMatch;
  });
};
  
const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  eventTime: String,
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

// API endpoint to get ALL users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// API endpoint to get user details based on phoneNumber
app.get('/api/users/:phoneNumber', async (req, res) => {
  try {
    //const user = await User.findById(req.params.userId)//.populate('friends');
    const phoneNumber = req.params.phoneNumber;
    const user = await User.findOne({ phoneNumber });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create a post
app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to return all posts 
app.get('/api/posts', async (req, res) => {
    try {
        const users = await Post.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  // API endpoint to user's post 
app.get('/api/posts/:phoneNumber', async (req, res) => {
    try {
        //const user = await User.findById(req.params.userId)//.populate('friends');
        const phoneNumber = req.params.phoneNumber;
        const user = await User.findOne({ phoneNumber });
        const userID = user._id
        const post = await User.findById(userID)
        res.json(post);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});

// API endpoint to add friend to user
app.put('/api/users/:phoneNumber1/:phoneNumber2', async (req, res) => {
  try {
    //const user = await User.findById(req.params.userId)//.populate('friends');
    const phoneNumber1 = req.params.phoneNumber1;
    const phoneNumber2 = req.params.phoneNumber2;
    const user = await User.findOne({ phoneNumber1 });
    const friend = await User.findOne({ phoneNumber2 });
    user.friends.push(friend);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to remove friend from user
app.put('/api/users/:phoneNumber1/:phoneNumber2', async (req, res) => {
  try {
    const phoneNumber1 = req.params.phoneNumber1;
    const phoneNumber2 = req.params.phoneNumber2;
    const user = await User.findOne({ phoneNumber1 });
    const friend = await User.findOne({ phoneNumber2 });
    user.friends = user.friends.filter(f => f !== friend);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

// API endpoint to sign in user
app.get('/api/signIn', async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const user = await User.findOne(phoneNumber);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) return res.status(401).json({ error: 'Incorrect password' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
