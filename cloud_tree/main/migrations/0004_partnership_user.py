# Generated by Django 3.2.6 on 2021-09-29 19:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20210928_1505'),
    ]

    operations = [
        migrations.AddField(
            model_name='partnership',
            name='user',
            field=models.CharField(default=None, max_length=200, null=True),
        ),
    ]