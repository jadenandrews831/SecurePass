from django.db import models

class EmployeeInfo(models.Model):
    employee_id = models.CharField(max_length=10, primary_key=True)
    password = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=50)
    training = models.CharField(max_length=50)
    post_history = models.CharField(max_length=50)

    ordering = ['last_name']