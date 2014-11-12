Thought Machine Test App
========================

An app to allow customers to record the contents of their home for use by
a home removals company.

To install run `npm install`.

To run the tests use `npm test`.

To execute use `gulp watch-serve` and travel to `http://localhost:8080`.

This uses mobile-style UX metaphors so if you're wondering where the edit button
is then please slide a list item left to find out.

I think it's also possible to run this on a device as I used an old phonegap
seed project I had lying around to bootstrap it. If you are on OSX and have XCode
installed then you should be able to `gulp emulate` (assuming my installation
process was successful.)

There seem to be a few bugs with ionic (beta) and the Firebase version in use:
 - Uncaught TypeError: Cannot read property 'style' of null.
 - FIREBASE WARNING: Firebase.DataSnapshot.name() being deprecated.
   Please use Firebase.DataSnapshot.key() instead.
