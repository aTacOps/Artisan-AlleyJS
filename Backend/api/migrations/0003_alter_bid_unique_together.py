# Generated by Django 5.1.3 on 2024-11-10 06:28

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_job_options'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='bid',
            unique_together={('job', 'bidder')},
        ),
    ]