# Manabu
> Manabu means "learn" in Japanese. It is a content site allowing Admins to post video and written content which users can access.

## Architecture

### Overview

Manabu is built on vanilla NodeJS and relies on MongoDB for it's database. It has minimal client-side JavaScript logic.

There is provision made for storing media either locally or on S3.
There is also auth capabilities provided by Keycloak (or can be swopped out for an alternate provider).


#### Running the code

Manabu is super simple in that it does not require any building before running it. All bootstrap tasks are taken care of by the NPM tasks configured in the `package.json` file.

##### Getting Application running

1. Ensure that MongoDB is installed [see here for installation instructions](https://docs.mongodb.com/manual/installation/). MongoDB needs to run on port 27017
2. Run `npm install` in order to install all the packages which are listed in the package.json file. (node needs to be installed on the local machine)
3. Run `npm run start` in order to run the DB migrations which populates the database with data located in the migration script and starts up the application on port 3005.
4. Go to http://localhost:3005 to access the application

### Technology

Although there is some "Ajax" logic in the app, for example where we need to save progress as a user consumes the content ( `public/javascripts/controllers/LessonController`), it is mostly rendered on the server side.

Rendering on the server happens with [pug](https://github.com/pugjs/pug).  The app also relies on [turbolinks](https://github.com/turbolinks/turbolinks) to speed up the user experience without building a full-scale single page web app. To make it easier to do some client-side logic with turbolinks, the app can also work with [stimulus.js](https://stimulusjs.org/).

##### Dependencies:

Manabu expects certain environment variables and config in order to run correctly. These are stored in the .env file:

1. **MONGO_URL:** It needs is a valid connection [URI to a MongoDB instance](https://docs.mongodb.com/manual/reference/connection-string/)
2. **AWS_ACCESS_KEY_ID:** It needs a valid AWS_ACCESS_KEY for communicating with S3
3. **AWS_SECRET_ACCESS_KEY:** It needs a valid AWS_SECRET_ACCESS_KEY for communicating with S3 
4. `keycloak.json` It needs a valid keycloak.json file in the root folder

##### Debugging the code on your developer machine

If you would like to inspect the code with developer tools, follow these steps:

1. Run the command to start the app in debug mode: `npm run debug`
2. Open chrome, and navigate to `chrome://inspect`
3. Click on the inspect button next to the row for the app, usually port `3005`
4. The developer tools will open with a breakpoint that paused execution, allowing you to add a breakpoint at the correct location and resuming the code.
5. Often it's easier just to add a `debugger` statement where you would like to debug and to start from **step 1** of these instructions

##### Keycloak

For:
1. Adding keycloak to the application [see here](/docs/installing_keycloak.md)
2. Running a local keycloak instance using Docker [see here](/docs/running_docker_keycloak.md)


##### Connecting to AWS 

1. [see here] (/docs/setup_aws.md) 