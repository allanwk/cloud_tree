from django.urls import path
from .views import *

app_name = 'frontend'

urlpatterns = [
    path('', home, name="home"),
    #path('register', register_request, name="register"),
    #path('login', login_request, name='login')
]
