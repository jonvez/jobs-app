# jobs-app

An application that allows admin users to login and create a questionnaire composed of a series of questions that can
be sent to a prospective job candidate.  The candidate is notified via email and is prompted to respond to the questions
within the application.  Admin users can review the candidate's submission once the candidate has indicated their
response is complete.

### Installation

Please first send me your GitHub username so that I can add you to the project.

From a terminal window, download the code:
```
git clone git@github.com:jonvez/jobs-app.git
```

Install the dependencies:
```
cd jobs-app
npm install
```

Start Mongo and restore the database backup:
```
mongod &
mongorestore dump/jobs-app
```

Start the application:
```
npm start &
```

In a browser, navigate to the app: [http://localhost:3000](http://localhost:3000)

### Using the app

**As an Admin:** Click 'Register' to set up an account.  Currently anybody can do this; in the real world, of course,
admin access would be managed.

1. Create a candidate.
2. Create some questions, and/or select from existing ones.
3. Review and send the questionnaire email.
4. Review responses to questionnaires (the link is at the bottom of the admin home screen).

**As a Candidate:** 

Route 1: Check your email; look for an email with a subject beginning with "JOBS-APP: ".  Make sure to check
your spam folder (the sendmail implementation is not using a real SMTP server).  Copy the link into a separate incognito
 window. Answer the questions and save your responses.  When your responses are complete, submit your response.

Route 2: Navigate to [http://localhost:3000](http://localhost:3000).  Enter a `questionnaire.candidate`'s email address.  If the email address corresponds to a questionnaire that has not been completed, you will be redirected to the appropriate questionnaire.
