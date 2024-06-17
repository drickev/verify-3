# verify-alliance--drickevstore

**Bot Creation Steps**
1. Go to https://discord.com/developers
2. On the application page, click "new application" 
3. Give the bot a name and description (optional).
4. In the "bot" tab activate the 3 buttons in the "intense gateway privileges" section
5. Go to OAuth2 and check the things the bot needs:
*scoop*
- application.command
- bots
*bot permissions*
- manage server (general permissions)
- manage roles (general permissions)
- manage channels (general permissions)
- send messages (text permission)
- manage messages (text permission)
- embed links (text permission)
- attach files (text permission)
- read message history (text permission)
- mention everyone (text permission)
- use slash command (text permission)
then copy the link that appears at the bottom
6. Enter Discord then paste the link on the server to install the bot then click the link
7. Give the role with admin permission to the moderator

**VPS Installation**
*in this case the admin uses a VM machine from GCP*
- open ssh
- enter the following commands in sequence:
```sudo apt-get update```
```sudo apt-get install -y default-jre-headless```
- go to https://github.com/nodesource/distributions/blob/master/README.md then install node.js according to the vps disk *in this case the admin uses ubuntu*
Using Ubuntu (Node.js 22)
```sudo apt-get install -y curl```
```curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh```
```sudo -E bash nodesource_setup.sh```
```sudo apt-get install -y nodejs```
then verify with ```node -v```
- create a directory with the command ```mkdir``` then the folder name *example* ```mkdir bot```
- enter the bot file into ssh *in this case the admin uses github*
```git clone https://github.com/drickev/verify-3.git```
- once finished, go to the bot file directory and type ```npm i```
- then install unzip ```sudo apt-get install unzip```
- then open https://bun.sh then select linux and copy the command ```curl -fsSL https://bun.sh/install | bash``` 
- then type ```bun install``` To install dependencies

**Bot configuration :**
1. Open your VPS panel and go to the bot directory, then go to */src* and edit the config.ts file. On strings 

` BOT_TOKEN: `
` 'TOKEN_HERE', //replace TOKEN_HERE with your bot token `
replace "TOKEN_HERE" with your bot token.

2. in config.ts in string 
```ALLIANCE_LIST: [
        {
            name: 'Storm',
            role_id: '1248994303242407978',
        },
        {
            name: 'Crimson',
            role_id: '1248994381667631154',
        },
        {
            name: 'Legends',
            role_id: '1248994416706981889',
        },
        {
            name: 'Moon',
            role_id: '1250095818820554833',
        },
    ],
```
Change the value after "name:" using the name of the alliance registered on your server then in "role_id:" enter the role ID of the alliance on your server following the alliance name. You can add or reduce the number of alliances and their roles.

3. To make the bot only detects images in the verification channel, change the ID number 
``` VERIFY_CHANNEL_ID: '1250810845298950255',``` 
with the channel ID number on your server

4. On the line ``` ADMIN_ROLE_ID: ['915059991864561714'],``` 
Replace the ID number with your server admin role ID number. This functions so that the bot can mention the admin if a double/fake/manipulation occurs in the bot verify and also this functions so that the bot command can only be used by the admin/moderator

5. In the line ```DATABASE_URI: 'your_mongodb_database_url',``` replace your_mongodb_database_url with your database url (on the dashboard, go to database then select the database that the bot will connect to then click connect and select Drivers) exampel : ```mongodb+srv://yourdatabasenicknamehere:<your_password>@cluster0.fymiida.mongodb.net/type_your_database_name_here?retryWrites=true&w=majority&appName=Your_Cluster_here```



Activate the bot using ```bun .```

# Read carefully, missing any step will ruin entire step

**HOW TO USE BOTS**

for public : 
1. Type !<UID> then add the related screenshot (only valid on the related channel)

for admins: 
The bot is equipped with several commands that can only be accessed by the admin
1. /find [UID] = the bot will display the relevant UID along with the verified IGN, USER DISCORD ID, ROLE ID, and ALLIANCE.
2. /del [UID] = the bot will delete the associated UID from the database, to release the role the bot cannot release it automatically.
3. /export = to export verification data into an XLXS file
