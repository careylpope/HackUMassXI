
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
    phoneNumber: { type: String, unique: true },
    username: String,
    password: String,
    friends: [{ type: String }],
    //favoriteFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    currentPost: String,
  });

UserSchema.pre('save', async function (next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);  // generate a salt
        const hash = await bcrypt.hash(user.password, salt);  // hash the password using our new salt
        user.password = hash;                                 // override the cleartext password with the hashed one
        next();
    } catch (error) {
        return nexT(error);
    }
});

// Compare passwords method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
  } catch (error) {
      throw error;
  }
};
  
const PostSchema = new mongoose.Schema({
  phoneNumber: String,
  content: String,
  eventTime: String,
  participants: [{ type: String }],
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
app.post('/api/createPost', async (req, res) => {
  try {
    const post = new Post(req.body);
    const phoneNumber = req.body.phoneNumber;
    const user = await User.findOne({ phoneNumber });
    user.currentPost = post._id;
    await post.save();
    await user.save();
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

// API endpoint to return a user's post 
app.get('/api/posts/:phoneNumber', async (req, res) => {
  try {
      //const user = await User.findById(req.params.userId)//.populate('friends');
      const phoneNumber = req.params.phoneNumber;
      const [user] = await User.find({ phoneNumber: phoneNumber });
      const postID = user.currentPost;
      const post = await Post.findById(postID);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// API endpoint to 'pop' a user's post
app.post('/api/removePost/:phoneNumber', async (req, res) => {
  try {
      //const user = await User.findById(req.params.userId)//.populate('friends');
      const phoneNumber = req.params.phoneNumber;
      const [user] = await User.find({ phoneNumber: phoneNumber });
      const [post] = await Post.find({ postID: user.currentPost});
      user.currentPost = "";
      await user.save();
      const deletedPost = await Post.deleteOne(post);
      Post.delete
      res.json(deletedPost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// API endpoint to add friend to user
app.post('/addFriend/:phoneNumber/:cellphone', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    const cellphone = req.params.cellphone;
    const [user] = await User.find({ phoneNumber: phoneNumber });
    const [friend] = await User.find({ phoneNumber: cellphone });
    if (user.friends.some(fph => fph === friend.phoneNumber)) return res.status(404).json({ error: 'Friend already added' });
    user.friends.push(friend.phoneNumber);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to add friend to user
app.post('/removeFriend/:phoneNumber/:cellphone', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    const cellphone = req.params.cellphone;
    const [user] = await User.find({ phoneNumber: phoneNumber });
    const [friend] = await User.find({ phoneNumber: cellphone });
    if (!user.friends.some(fph => fph === friend.phoneNumber)) return res.status(404).json({ error: 'Friend doesn\'t exist' });
    user.friends = user.friends.filter(fph => !(fph === friend.phoneNumber));
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to sign in user
app.get('/api/signIn', async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const user = await User.findOne({ phoneNumber });  
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
