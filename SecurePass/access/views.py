from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import *

#TO DO: Check if the employee is in the database, then redirect to check page. If not, alert the user that they are not in the database. 
        # ("Employee ID not found. Please check entered credentials. If access issues persist, please contact your administrator.")
def login(request): 
    return render(request, "login.html") 

#TO DO: Check if the employee has completed training, is in an eligible role, and has no negative post history.
        # If all are true, display pass. Give user platforms to choose from to post to, then redirect to create page.
        # If not, display fail and what part of the check failed.
def check(request): 
        
    return render(request, "check.html") 

#TO DO: Page should allow user to add images, videos, and text to a post. Submit button should redirect to loading page.
        # Allow user to cancel the post and return to the check page.
def create(request): 
    return render(request, "create.html")

#TO DO: Any text, images, or videos submitted should be scanned by the AI.
        # Allow the user to cancel the post and return to the create page.
def loading(request): 
    return render(request, "loading.html")

#TO DO: This page will display the results of the AI scan.
        # If the AI determines that the post is safe, the port to the social media platform should be opened with a time limit of __ hours. The security team will be notified of the post.
        # If the AI determines the post is unsafe the user will be able to edit the post and resubmit it. A second failure will result in the post being deleted and the user being banned from the platform for __ hours.
        # The failure will be logged in the database under negative post history and both the user and security team will be notified.
def results(request): 
    return render(request, "results.html")

#TO DO: This page will allow the user to log out of the system.
        # The user's session will be ended and they will be redirected to the login page.
def logout(request): 
    return render(request, "login.html")
 