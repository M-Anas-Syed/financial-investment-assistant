# Generated by Django 4.1.5 on 2023-02-20 02:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fia", "0009_portfolio_portfolio_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolio",
            name="total_price",
            field=models.FloatField(default=0),
        ),
    ]
