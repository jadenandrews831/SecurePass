// !) load org code from config.js
// 2) if code is null, prompt user to enter a code within a new tab. If org is identified, user provides details to server,
//  then is given an instance id. After both numbers have been created, the extension interface will show if secure pass is 
//  listening or not. If securepass is listening, it will provide an option to upload a file to be checked by the model.  
//  The extension will have a blacklist of files to flag automatically based on name and checksum. It will also be able to monitor 
//  live text for certain flagged patterns. If a blacklisted file is added to a post, securepass will block posting by redirecting
//  the user to a new tab which will prompt them to upload the file. All file uploads will be passively checked by the model for the
//  same flagged content as the monitored text. After a document is checked, the server creates a checksum for it, and adds it to a
//  whitelist. If a file's checksum is not on the whitelist, the post will be blocked, and the user will be redirected to a new 
//  tab which will prompt them to upload the file. 

