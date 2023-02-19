from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Portfolio, AccountOverview

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ('id','user', 'stock_symbol', 'purchase_date', 'stock_price', 'stock_quantity')


class AccountOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountOverview
        fields = ('id', 'user', 'account_value')