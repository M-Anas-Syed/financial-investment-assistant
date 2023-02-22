# Generated by Django 4.1.5 on 2023-02-19 18:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fia", "0008_remove_portfolio_value_accountoverview"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="portfolio",
            constraint=models.UniqueConstraint(
                fields=("user", "stock_symbol"), name="portfolio_id"
            ),
        ),
    ]
