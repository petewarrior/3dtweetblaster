3dtweetblaster
==============
Display tweets of your chosen keyword in 3D text. Uses the Twitter Streaming API and three.js.

Installation
------------
1. Download the repository
2. Install dependencies using npm: `npm install`
3. Create a Twitter API key on http://dev.twitter.com
4. Create a file named `authInfo` (case sensitive) in the application root dir containing the following lines. Fill the blanks with the Twitter key.
`    var auth = {
      consumer_key: '',
      consumer_secret: '',
      access_token: '',
      access_token_secret: ''
    };`
5. Run the app: `npm start`
6. You can now try it out with a keyword of your choice on your browser: 
    `http://localhost:3000/canvas/<your keyword here>`
