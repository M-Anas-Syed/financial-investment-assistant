# Generated by Django 4.1.5 on 2023-02-20 02:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fia", "0010_portfolio_total_price"),
    ]

    operations = [
        migrations.AlterField(
            model_name="portfolio",
            name="stock_symbol",
            field=models.CharField(max_length=8),
        ),
    ]