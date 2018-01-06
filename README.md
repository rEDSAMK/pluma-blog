#Pluma
Headquarter and my personal blog Pluma Blog - Vincenzo 'rEDSAMK' Greco (not maintained at the moment)

The goal of Pluma is to make a light, secure and open source blog engine entirely made in MEAN stack.

Pluma is entirely crafted from scratch in full MEAN Stack. Authentication is performed with Json Web Tokens (JWTs).

The communication between front-end and back-end is entirely managed through the REST API, thus giving the opportunity to develop apps and software to manage the blog.

**NOTE**: At the moment both the code and the engine system itself are unripe, in need of a refactoring, good test units and some secondary features that a blog must have. But i'm pretty happy about the current work, the foundations for a functional blog system have been launched and the main features are already live.

If you like the project you are welcome to contribute on Github or in any other way, like a positive or negative comment. If you want you can also contribute by donating via Paypal, helping to finance the project and move my blog to new hosting.

Pluma is totally free and open source (relased under **Mozilla Public License 2.0**), developed only by me with the intent to study and improve my MEAN stack knowledge.

##Currently available feature:

- Authentication and user registration
- Avatar support in user registration
- User role support (currently Any, Admin, User
- Code highlighting in posts (thanks to Prism.js)
- Comments in posts (using Disqus platform)
- Post filter with TAGs
- Totally SAP (Single Page Application)
- Totally responsive UI
- Full REST API support
- Admin panel
- Change blog settings (currently: enable/disable sign up, navbar label and edit about page)
- Add/edit posts
- Upload banner (changing the default on the header) for each post
- Posts can have different status (trash, draft, publicated, private).
- Advanced RTF post editing (thanks to TinyMCE).
- Real time preview of the edited post
- User administration, changing role and basic user's fields


##ToDo's:

- [ ] Make a decent logo (if some designer would help me :))
- [ ] Unit tests
- [ ] Code refactoring
- [ ] Improve performance
- [ ] Find a better usage for user roles and signup
- [ ] I'm thinking about write a comment system made from scratch for better take advantage of user sign Up
- [ ] Write a simple web installer for the first-setup of the blog (creating the needed documents on mongodb database and create the admin account)
- [ ] Make the blog engine more customizable
- [ ] Adding the documentation for the server side REST API


##Pluma blog makes use of the following external library:

- AngularJS - MIT License
- jQuery - MIT License
- TinyMCE - LGPL 2.1 License
- angular-ui-tinymce - MIT License
- Bootstrap - MIT License
- ng-file-upload - MIT License
- Lodash.js
- ui-bootstrap-tpls - MIT License
- angular-ui-router - MIT License
- Prism.js - MIT License
- Font Awesome by Dave Gandy - http://fontawesome.io
- TODO: FINISH LIST

If i forgot some others external components used by this software i would ask you to report it and i recommend you to read their own license.
