# Bubble Up: Backend

## What is this?
This is the repository built for the purpose of hosting of a server for our teams mobile app *"Bubble Up"*.  It works using a node.js


## User/Post Schemas
### User:  
```
{
    phoneNumber: { type: String, unique: true },
    username: String,
    password: String,
    friends: [{ type: String }],
    currentPost: String,
}
```
### Post: 
```
{
  phoneNumber: String,
  content: String,
  eventTime: String,
  participants: [{ type: String }],
  location: {lat: Number, long: Number},
}
```
## API Endpoints

### General Descriptions
| Endpoint | Purpose |
|---------:|-----------|
|        /users| Returns JSON containing a list of all users|
|        /posts| Returns JSON containing a list of all posts|
|   /createUser| Creates new user in database through given JSON data|
|   /createPost| Creates new post in database through given JSON data|
|       /signin| Returns JSON of a user, if provided JSON containing sign-in criteria is a match for database|
|       /users/| Returns JSON containing a user through passed parameters|
|       /posts/| Returns JSON containing a post through passed parameters|
|  /removePost/| Removes a user posts through passed parameters|
|   /addFriend/| Returns JSON containing updated user with new friend added through passed parameters|
|/removeFriend/| Returns JSON containing updated user with friend removed through passed parameters|

### Detailed Descriptions
- **/users**: Returns JSON data that contains a list of all users stored in the associated database  

- **/post**: Returns JSON data that contains a list of all users stored in the associated database  

- **/createUser**: Returns JSON data that contains the new user created with information provided by a JSON formatted as...
```
{  
  "phoneNumber":"something here",  
     "username":"something here",  
     "password":"something here"  
}
```  

- **/createPost**: Returns JSON data that contains the new user created with information provided by a JSON formatted as...
```
{
  "phoneNumber":"something here",
  "content": "something here",
  "eventTime": "something here",
  "participants": [],
  "location": {
    "lat": something here, 
    "long": sometthing here
  }
}
```  

- **/signin**: Returns JSON data that contains an existing user in the case that the provided data matches an entry in the database - or JSON containing an error in the event of user not found or password mismatch.  Expects a provided JSON formatted as...
```
{  
  "phoneNumber":"something here",   
     "password":"something here"  
}
```  

- **/users/:phoneNumber**: Returns JSON data of a specific user by passed phoneNumber parameter, if one exists.
Example: *..../users/4135556879*

- **/posts/:phoneNumber**: Returns JSON data of a specific post by passed phoneNumber paramater, if one exists.  
Example: *..../posts/4135556879*  

- **/removePost/:phoneNumber**: Returns JSON data of result of "deleteOne(...)", deleting a post through passed phoneNumber parameter, if one exists.  Also deletes the link to the post stored in the user with this unique phoneNumber.
Example: *..../removePost/4135556879*

- **/addFriend/:phoneNumber/:cellphone**: Returns JSON data of updated user with new friend added, if both exist, given by passed phoneNumber and cellphone parameters respectively.  
Example: *..../addFriend/4135556879/911*

- **/removeFriend/:phoneNumber/:cellphone**: Returns JSON data of updated user with friend removed, if both exist, given by passed phoneNumber and cellphone parameters respectively.  
Example: *..../removeFriend/4135556879/911*
