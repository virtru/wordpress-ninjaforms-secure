# Secure Ninja Forms in Wordpress using the Virtru Platform 
WordPress is ubiquitous and fantastic.  Using Ninja Forms greatly extends the functionality of WordPress by simplifying the creation of forms and management of the associated data.  The data is stored by Ninja Forms unencrypted.  By leveraging the [Virtru Developer Platform](https://developer.virtru.com) and using the Virtru Ninja Forms Extension, the submitted data can be encrypted before it even leaves the client’s browser.  Once the Virtru Ninja Forms Extension is installed, all submissions are encrypted. The encryption policy is owned by the form submitter, meaning the submitter has control to:
- Add Users to a Virtru Encryption Policy
- Remove Users from a Virtru Encryption Policy
- Revoke a Virtru Encryption Policy
Initially the Wordpress Administrator Email is added to the Virtru Encryption Policy. 

## Walkthrough video and tutorial
For videos and tutorials, please visit the related [blog post](https://medium.com/@chadtsigler/ae661e0fefe9).
## Build Requirements
- [node.js](https://nodejs.org/) v8.12+ 
- [npm](https://www.npmjs.com/) v6.4+
## Install Requirements
- Latest version of WordPress
- NinjaForms Extension
- Virtru NinjaForms Extension
- Email assigned to “WordPress Site Administrator”
## Building the Extension
Obtain the Repository
- Clone the Repository
```
git clone https://github.com/virtru/wordpress-ninjaforms-secure.git
```
- Download the Zip File
```
curl https://github.com/virtru/wordpress-ninjaforms-secure/archive/master.zip -o wordpress-ninjaforms-secure.zip
```
Unzip the download
```
cd wordpress-ninjaforms-secure-master
npm install
npm run build
```
- zip the nf-virtru-plugin folder
- ready to install 
 
## Help
Thank you for using the Virtru Developer Platform!  
For any assistance, please visit:
- [Virtru Developer Platform](https://developer.virtru.com)
- [Create a Support Ticket](https://developer.virtru.com/docs/contact-us)
- [Join our Slack Channel](https://developer.virtru.com/docs/contact-us)

The Virtru Team.
