"""investment_assistant URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from fia import views

urlpatterns = [
    path('', views.index, name='index'),
    path('admin/', admin.site.urls),
    path('register', views.RegisterView.as_view(), name='register'),
    path('login', views.LoginView.as_view(), name='login'),
    path('buy', views.Action.as_view(), name='buy'),
    path('portfolio', views.PortfolioView.as_view(), name='portfolio'),
    path('search', views.Search.as_view(), name='search'),
    path('chart', views.Chart.as_view(), name='chart'),
    path('logout', views.Logout.as_view(), name='logout'),
    path('allportfolios', views.AllPortfolios.as_view(), name='allportfolios'),
    path('forumquestion', views.ForumQuestions.as_view(), name='forumquestion'),
    path('forumresponse', views.ForumAnswers.as_view(), name='forumresponse'),
    path('resetpassword', views.PasswordReset.as_view(), name='resetpassword')
]

