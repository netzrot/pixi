Pixis, class project for NYCDA
- Thorsten Schroeder, James Kim, Darren Klein

Description:
Pixis is a 'clone' of Instagram, built with NodeJS/Express... users create profiles, log in, upload images (Pixis) with captions, and can comment on each other's images.

A few notable features...
	- Users can tag each other in posts by their usernames.
	- Users can only delete and edit posts that they have created.

Instructions:
- Clone this repo and 'cd' into the directory
- Run 'npm install' to install dependencies
- Start the server via 'node app.js' or 'nodemon' (if you have installed 'nodemon' globally)
- visit 'localhost:3000' to get started

Caveats:
- For the time-being images are stored locally in /public/uploads, so this is not a fully-deployable app
- Various validations still need to be handled... for example, the app will stall if you try to tag a non-existent user in an image (or make a typo in their name)
- It's a work-in-progress!!!