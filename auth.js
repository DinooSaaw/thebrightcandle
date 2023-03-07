const { RefreshingAuthProvider } = require('@twurple/auth');
const { ChatClient } = require('@twurple/chat');
const fs = require('fs').promises;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
fs.readFile('./token.json', 'UTF-8')
  .then((data) => {
    const tokenData = JSON.parse(data);
    const authProvider = new RefreshingAuthProvider({
      clientId,
      clientSecret,
      onRefresh: async (userId, newTokenData) => {
        await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8');
      }
    });

    authProvider.addUserForToken(tokenData, ['chat']);
}).then(() => {
  console.log('new token created');
})
