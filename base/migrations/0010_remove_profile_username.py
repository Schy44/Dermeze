# Generated by Django 5.1.2 on 2024-11-24 11:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0009_profile_username_alter_profile_email_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='username',
        ),
    ]
