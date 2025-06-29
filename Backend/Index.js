const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const parser = require('body-parser');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const app = express();
const router = express.Router();
const storage = multer.memoryStorage();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Set the file size limit (50 MB in this example)
});
const activitylog = require('./schemas/activitylog')
const admin = require('./schemas/admin')
const educationalcontent = require('./schemas/educationalcontent')
const goal = require('./schemas/goal')
const post = require('./schemas/post')
const user = require('./schemas/user')
const chat = require('./schemas/chat')

const e = require('cors');

// Middleware
app.use(parser.json({ limit: '50mb' })); // Increase the limit for JSON payload
app.use(parser.urlencoded({ limit: '50mb', extended: true })); // Increase for URL-encoded payload
app.use(cors());
app.use(parser.json());
app.use('/users', router); // Register router with /users prefix

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/natura')
  .then(() => console.log('DB Connected'))
  .catch((err) => console.error('DB Not Connected:', err));


  router.put('/update', upload.single('profilePic'), async (req, res) => {
    try {
      const { username, bio, commutingMethods, energySources, dietaryPreferences, password, preferredReminder } = req.body;
      let profilePic = req.body.profilePic; // Get profilePic from the request body
  
      // Check if profilePic is an empty array, and if so, don't update it
      if (Array.isArray(profilePic) && profilePic.length === 0) {
        console.log('Empty profilePic array, not updating profile picture.');
        profilePic = undefined;  // Do not update profilePic if it's an empty array
      }
  
      // If no file is uploaded and profilePic is not set, remove profilePic from the update data
      if (!req.file && !profilePic) {
        profilePic = undefined;  // Ensure profilePic is not updated if neither a file nor base64 is provided
      }
  
      // Check if a profile image was uploaded via multer
      if (req.file) {
        // Convert the uploaded image to binary buffer
        const imageBuffer = req.file.buffer;
        profilePic = {
          contentType: req.file.mimetype,
          data: imageBuffer
        };
      } else if (profilePic && profilePic.data && profilePic.data.$binary) {
        // If profilePic is in base64 format, convert to binary buffer
        const imageBuffer = Buffer.from(profilePic.data.$binary.base64, 'base64');
        profilePic = {
          contentType: profilePic.contentType,
          data: imageBuffer
        };
      }
  
      // Prepare the data to update
      const updateData = {
        username,
        bio,
        commutingMethods,
        energySources,
        dietaryPreferences,
        preferredReminder,
        password,
        // Only update profilePic if it's provided (and not an empty array)
        profilePic: profilePic ? {
          contentType: profilePic.contentType,
          data: profilePic.data
        } : undefined, // If profilePic is not provided, it won't be updated
      };
  
      // Log the update data to check if profilePic is included
      console.log('Data to update in database:', updateData);
  
      // Update the user profile in the database
      const updatedUser = await user.findOneAndUpdate(
        { username: username },
        updateData,
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile', error });
    }
  });
  
  
  
   
  
app.post('/register', async (req, res) => {
  const { username, email, password, phone } = req.body;

  // Check if the required fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email already exists
    const isUseremail = await user.findOne({ email });
    if (isUseremail) {
      return res.status(400).json({ message: 'E-mail already in use' });
    }
    const isUsername = await user.findOne({ username });
    if (isUsername) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new user({
      username,
      email,
      phone,
      password,
      bio: "",
      commutingMethods: "",
      energySources: "",
      dietaryPreferences: "",
      preferredReminder: "",
      profilePic: [{
        contentType: "",
        data: ""
      }],
      friendList: [] // Default empty array
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user is in the admin database
  const foundAdmin = await admin.findOne({ email });
  if (foundAdmin) {
    // If the admin is found, check the password (no bcrypt comparison)
    if (foundAdmin.password !== password) {
      return res.status(400).json({ message: 'Invalid admin password credentials' });
    }

    // Generate token with admin role and include username and email
    const token = jwt.sign(
      {
        id: foundAdmin._id,
        username: foundAdmin.username, // Add username
        email: foundAdmin.email,       // Add email
        role: 'admin'                  // Add role
      },
      'Secret', // Use your own secret
      { expiresIn: '1h' }
    );
    return res.json({ token });
  }

  // If the user is not an admin, check the regular user database
  const foundUser = await user.findOne({ email });
  if (!foundUser) {
    return res.status(400).json({ message: 'Invalid E-mail credentials' });
  }

  // Compare password directly (no bcrypt comparison)
  if (foundUser.password !== password) {
    return res.status(400).json({ message: 'Invalid Password credentials' });
  }

  // Generate token for regular user and include username and email
  const token = jwt.sign(
    {
      id: foundUser._id,
      username: foundUser.username, // Add username
      email: foundUser.email,       // Add email      
    },
    'Secret',
    { expiresIn: '1h' }
  );

  res.json({ token });
});

app.post('/send', async (req, res) => {
  const { sender, receiver, content } = req.body;

  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find an existing chat between the sender and receiver
    let existingChat = await chat.findOne({
      participants: { $all: [sender, receiver] }, // Check for both participants
    });

    if (!existingChat) {
      // Create a new chat if it doesn't exist
      existingChat = new chat({
        participants: [sender, receiver],
        messages: [],
      });
    }

    // Add the new message to the chat
    const newMessage = {
      sender,
      receiver,
      content: content,
      timestamp: new Date(),
      isRead: false,
    };

    existingChat.messages.push(newMessage);

    // Save the updated chat
    await existingChat.save();

    res.status(201).json({ success: true, message: 'Message sent successfully.', chat: existingChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending message.' });
  }
});

app.get('/chat/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const thechat = await chat.findOne({
      participants: { $all: [user1, user2] }
    });

    if (thechat) {
      res.json(thechat.messages); // Send messages if chat is found
    } else {
      res.json([]); // Return empty array if no chat found
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).send('Server error');
  }
});

// Route to update message status to 'read'
app.put('/chat/messages/read', async (req, res) => {
  try {
    const { messageIds } = req.body;

    // Update the isRead status to true for messages matching the provided messageIds
    const result = await chat.updateMany(
      { "messages._id": { $in: messageIds } }, // Find chats containing the specific message IDs
      { $set: { "messages.$[message].isRead": true } }, // Update the isRead field for matched messages
      { arrayFilters: [{ "message._id": { $in: messageIds } }] } // Use array filters to target specific messages
    );

    res.status(200).json({ message: 'Messages marked as read', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Middleware for Role-Based Access
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token.split(' ')[1], 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

app.get('/users/:username', (req, res) => {
  const username = req.params.username;
  // Fetch user from database by username
  user.findOne({ username: username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);  // Send user data
    })
    .catch(err => res.status(500).json({ message: 'Error fetching user data' }));
});

app.get('/all-usernames', async (req, res) => {
  try {
    const users = await user.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err });
  }
});

app.post('/add-friend', async (req, res) => {
  const { currentUsername, friendUsername } = req.body;

  try {
    // Validate input
    if (!currentUsername || !friendUsername) {
      return res.status(400).json({ message: 'Both usernames are required.' });
    }

    // Check if the friend exists in the database
    const friend = await user.findOne({ username: friendUsername });
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found.' });
    }

    // Check if the current user exists
    const currentUser = await user.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const friendUser = await user.findOne({ username: friendUsername });
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend not found.' });
    }

    // Check if the friend is already in the user's friend list
    const isAlreadyFriend = currentUser.friendList.some(
      (f) => f.username === friendUsername
    );

    if (isAlreadyFriend) {
      return res.status(400).json({ message: 'User is already in the friend list.' });
    }

    // Add the friend to the user's friend list
    currentUser.friendList.push({ username: friendUsername });
    await currentUser.save();

    friendUser.friendList.push({ username: currentUsername });
    await friendUser.save();

    res.status(200).json({ message: 'Friend added successfully.' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

app.post('/remove-friend', async (req, res) => {
  const { currentUsername, friendUsername } = req.body;

  try {
    // Validate input
    if (!currentUsername || !friendUsername) {
      return res.status(400).json({ message: 'Both usernames are required.' });
    }

    // Find the current user and the friend
    const currentUser = await user.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const friendUser = await user.findOne({ username: friendUsername });
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend not found.' });
    }

    // Remove current user from the friend's friend list
    const currentUserIndex = friendUser.friendList.findIndex(
      (friend) => friend.username === currentUsername
    );
    if (currentUserIndex !== -1) {
      friendUser.friendList.splice(currentUserIndex, 1);
      await friendUser.save();
    }

    // Remove friend from the current user's friend list
    const friendIndex = currentUser.friendList.findIndex(
      (friend) => friend.username === friendUsername
    );
    if (friendIndex === -1) {
      return res.status(404).json({ message: 'Friend not found in friend list.' });
    }

    currentUser.friendList.splice(friendIndex, 1);
    await currentUser.save();

    res.status(200).json({ message: 'Friend removed successfully from both users.' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


app.post('/activity-log', async (req, res) => {
  try {
    const activityData = req.body;
    const activityLog = new activitylog(activityData);
    await activityLog.save();
    res.status(201).json({ message: "Activity log saved successfully", activityLog });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/educational-content', upload.array('pictures', 5), async (req, res) => {
  try {
    const pictures = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

    const newEducationalContent = new educationalcontent({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      url: req.body.url,
      category: req.body.category,
      tags: req.body.tags,
      pictures: pictures
    });

    const savedEducationalContent = await newEducationalContent.save();

    res.json(savedEducationalContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/achievement', async (req, res) => {
  try {
    // Fetch the active achievement based on the provided ID (or title)
    const achievementId = req.body.achievementId;  // This should come from the request body
    const activeAchievement = await goal.findById(achievementId);

    if (!activeAchievement) {
      return res.status(404).json({ message: 'Active achievement not found' });
    }

    // Get the pictures associated with the achievement (assuming pictures are stored directly in the achievement)
    const pictures = activeAchievement.pictures.map(picture => ({ 
      data: picture.data, 
      contentType: picture.contentType 
    }));

    // Create a new post document using the pictures from the achievement
    const newPost = new post({
      username: req.body.username,
      description: req.body.description || '',
      like: [], // Default value for likes
      comments: [], // Empty array for comments
      pictures: pictures
    });

    // Save the new post to the database
    const savedPost = await newPost.save();

    // Send the saved post as the response
    res.json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/post', upload.array('pictures', 5), async (req, res) => {
  try {
    // Map uploaded files to the pictures array with `data` and `contentType`.
    const pictures = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

    // Create a new post document based on the schema.
    const newPost = new post({
      username: req.body.username,
      description: req.body.description || '',
      like: [], // Default value for likes.      
      comments: [], // Empty array for initial comments.
      pictures: pictures
    });

    // Save the new post to the database.
    const savedPost = await newPost.save();

    // Send the saved post back as the response.
    res.json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/post', async (req, res) => {
  try {
    const username = req.query.username;

    // Validate username
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    // Find posts by username
    const posts = await post.find({ username: username });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/like-post', async (req, res) => {
  const { postId, username } = req.body;

  try {
    const posts = await post.findById(postId);
    if (!posts) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const likeIndex = posts.like.findIndex((like) => like.username === username);
    if (likeIndex === -1) {
      posts.like.push({ username });
    } else {
      posts.like.splice(likeIndex, 1);
    }

    await posts.save();
    res.status(200).json({ message: 'Like toggled successfully.', likes: posts.like });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Route to update progression
app.put('/progression', async (req, res) => {
  const { goalId, objectiveName, isChecked, username } = req.body;

  try {
    const goalData = await goal.findById(goalId);

    if (!goalData) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    let userProgression = goalData.progression.find(p => p.username === username);

    if (!userProgression) {
      userProgression = { username: username, listObj: [], percentage: 0, repetition: 0 };
      goalData.progression.push(userProgression);
    }

    // Update the user's progression
    if (isChecked) {
      if (!userProgression.listObj.some(o => o.comObj === objectiveName)) {
        userProgression.listObj.push({ comObj: objectiveName });
      }
    } else {
      userProgression.listObj = userProgression.listObj.filter(o => o.comObj !== objectiveName);
    }

    // Calculate the new progress percentage
    const totalObjectives = goalData.objective.length;
    const completedObjectives = userProgression.listObj.length;

    userProgression.percentage = Math.round((completedObjectives / totalObjectives) * 100);

    // Check if all objectives are completed (100%)
    if (userProgression.percentage === 100) {
      userProgression.repetition++;
      userProgression.listObj = [];  // Clear objectives list after reaching 100%      
    }

    // Save the goal data
    await goalData.save();

    // Return updated goal data
    res.status(200).json({ message: 'Progression updated successfully', data: goalData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error });
  }
});

app.put('/reset-progress', async (req, res) => {
  const { goalId, username, reset } = req.body;

  if (!reset) {
    return res.status(400).json({ message: 'Reset flag is required' });
  }

  try {
    const goalData = await goal.findById(goalId);

    if (!goalData) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    let userProgression = goalData.progression.find(p => p.username === username);

    if (!userProgression) {
      return res.status(404).json({ message: 'User progression not found' });
    }

    // Reset the user's progression
    userProgression.percentage = 0;
    userProgression.listObj = [];  // Clear the list of completed objectives
    

    // Save the updated goal data
    await goalData.save();

    // Return a success message
    res.status(200).json({ message: 'User progression has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error });
  }
});

// Route to add progression
app.put('/addProgression', async (req, res) => {
  const { goalId, username } = req.body;

  try {
    const goalData = await goal.findById(goalId);

    if (!goalData) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if the user already has a progression
    const existingProgression = goalData.progression.find(p => p.username === username);

    if (existingProgression) {
      return res.status(400).json({ message: 'User already has progression for this goal' });
    }

    // Create a new progression for the user
    goalData.progression.push({
      username: username,
      listObj: [],
      percentage: 0,
      repetition: 0,
    });

    // Save the updated goal document
    await goalData.save();

    // Respond with the updated goal data
    res.status(200).json({ message: 'Progression added successfully', data: goalData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error });
  }
});


app.post('/add-comment', async (req, res) => {
  const { postId, username, comment } = req.body;

  try {
    const posts = await post.findById(postId);
    if (!posts) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Add the new comment
    posts.comments.push({ username, comment });

    await posts.save();
    res.status(200).json({ message: 'Comment added successfully.', comments: posts.comments });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


app.put('/educational-content/:id', upload.single('pictures'), async (req, res) => {
  try {
    const { id } = req.params;
    const picChange = req.body.picChange === 'true'; // Get picChange flag from the body
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      url: req.body.url,
      tags: req.body.tags,
    };

    // If picChange is true and a new picture is provided, update the picture
    if (picChange && req.file) {
      updateData.pictures = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updatedContent = await educationalcontent.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update educational content.' });
  }
});


app.get('/educational-content/all', async (req, res) => {
  try {
    const contentList = await educationalcontent.find();
    res.json(contentList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching educational content', error: err });
  }
});

app.get('/post/all', async (req, res) => {
  try {
    const postList = await post.find();
    res.json(postList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching educational content', error: err });
  }
});

app.get('/goal', async (req, res) => {
  try {
    const goalList = await goal.find();
    res.json(goalList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching goal', error: err });
  }
});

// Fetch specific educational content by ID
app.get('/educational-content/:id', async (req, res) => {
  const contentId = req.params.id;
  try {
    const content = await educationalcontent.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching specific content', error: err });
  }
});

app.get('/goal/:id', async (req, res) => {
  const goalId = req.params.id;
  try {
    const goals = await goal.findById(goalId);
    if (!goals) {
      return res.status(404).json({ message: 'Goals not found' });
    }
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching specific goal', error: err });
  }
});

app.delete('/educational-content/:id', async (req, res) => {
  try {
    const contentId = req.params.id;

    // Find and delete the content
    const result = await educationalcontent.findByIdAndDelete(contentId);

    if (!result) {
      return res.status(404).json({ message: 'Educational content not found' });
    }

    res.status(200).json({ message: 'Educational content deleted successfully', result });
  } catch (error) {
    console.error('Error deleting educational content:', error);
    res.status(500).json({ message: 'Error deleting educational content' });
  }
});

app.get('/activity-log/:username', async (req, res) => {
  try {
    const { username } = req.params; // Get the username from the URL parameters

    // Fetch activity logs where the username matches
    const activityLogs = await activitylog.find({ username });

    if (!activityLogs.length) {
      return res.status(404).json({ message: 'No activity logs found for the specified username' });
    }

    res.status(200).json(activityLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});


// Start server
app.listen(3000, () => console.log('Server running on port 3000'));