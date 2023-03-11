from django.contrib import admin
from .models import *

@admin.register(EmployeeInfo)
class EmployeeInfoAdmin(admin.ModelAdmin):
    list_display = [field.name for field in EmployeeInfo._meta.fields]
