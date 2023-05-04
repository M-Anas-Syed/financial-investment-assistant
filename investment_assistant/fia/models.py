from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    stock_symbol =  models.CharField(max_length=8)
    purchase_date = models.DateField()
    stock_price = models.FloatField(default=0)
    stock_quantity = models.IntegerField(default=0)
    total_price = models.FloatField(default=0)
    account_value= models.FloatField(default=10000.00)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'stock_symbol'], name='portfolio_id')
        ]

    def __str__(self):
        return self.stock_symbol

class AccountOverview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    account_value = models.FloatField(default=10000.00)

    def __str__(self):
        return str(self.account_value)


class ForumQuestion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    question = models.CharField(max_length=300, unique=True)
    date_created=models.DateTimeField(auto_now_add=True,null=True)
    answered = models.BooleanField(default=False)

    def __str__(self):
        return self.question

class ForumResponse(models.Model):
    belongs_to = models.ForeignKey(ForumQuestion, on_delete=models.CASCADE, default=1)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    response = models.CharField(max_length=300, unique=True)
    date_created=models.DateTimeField(auto_now_add=True,null=True)

    def __str__(self):
        return self.response

class Rankings(models.Model):
    user = models.CharField(max_length=8, unique=True)
    net_profit = models.IntegerField()
    net_loss = models.IntegerField()