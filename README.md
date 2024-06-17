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

