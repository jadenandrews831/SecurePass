from django.urls import path 
from . import views

urlpatterns = [ 
    path("", views.login, name="login"), 
    path("check/", views.check, name="check"), 
    path("create/", views.create, name="create"), 
    path("loading/", views.loading, name="loading"), 
    path("results/", views.results, name="results"), 
    path("logout/", views.logout, name="logout")
]