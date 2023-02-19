from django.urls import path
from .views import RegisterView, LoginView

urlpatterns = [
    path('register', RegisterView.as_view({'post': 'create'}), name='register'),
    path('login', LoginView.as_view({'post': 'login','get': 'login'}), name='login'),



]
