# Generated by Django 4.1.5 on 2023-01-29 18:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("fia", "0002_userprofile_birth_date"),
    ]

    operations = [
        migrations.RemoveField(model_name="userprofile", name="birth_date",),
    ]
