from django.shortcuts import render
from django.contrib import login_required
#login required 


def login(request): 
    return render(request, "login.html") 

@login_required
def check(request): 
    return render(request, "check.html") 

@login_required
def create(request): 
    return render(request, "create.html")

@login_required
def loading(request): 
    return render(request, "loading.html")

@login_required
def results(request): 
    return render(request, "results.html")


 