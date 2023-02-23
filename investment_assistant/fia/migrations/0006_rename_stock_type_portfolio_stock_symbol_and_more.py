# Generated by Django 4.1.5 on 2023-02-16 04:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fia", "0005_portfolio_stock_quantity_portfolio_user"),
    ]

    operations = [
        migrations.RenameField(
            model_name="portfolio", old_name="stock_type", new_name="stock_symbol",
        ),
        migrations.AddField(
            model_name="portfolio",
            name="value",
            field=models.FloatField(default=100000.0),
        ),
    ]