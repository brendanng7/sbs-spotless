# Generated by Django 5.0.4 on 2024-12-13 18:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('spotless', '0009_cleaningschedule_cleaning_checklist'),
    ]

    operations = [
        migrations.RenameField(
            model_name='cleaningchecklistitem',
            old_name='template_image',
            new_name='image',
        ),
    ]
