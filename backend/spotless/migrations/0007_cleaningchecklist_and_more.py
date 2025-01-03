# Generated by Django 5.0.4 on 2024-12-13 13:40

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotless', '0006_alter_cleaningschedule_cleaner'),
    ]

    operations = [
        migrations.CreateModel(
            name='CleaningChecklist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.RenameField(
            model_name='cleaningchecklistitem',
            old_name='image',
            new_name='template_image',
        ),
        migrations.RemoveField(
            model_name='cleaningchecklistitem',
            name='bus_model',
        ),
        migrations.RemoveField(
            model_name='cleaningcheckliststep',
            name='image',
        ),
        migrations.AddField(
            model_name='cleaningchecklistitem',
            name='is_image_required',
            field=models.BooleanField(default=False),
        ),
        migrations.RemoveField(
            model_name='cleaningschedule',
            name='cleaner',
        ),
        migrations.AddField(
            model_name='cleaningchecklistitem',
            name='cleaning_checklist',
            field=models.ForeignKey(default='1', on_delete=django.db.models.deletion.CASCADE, to='spotless.cleaningchecklist'),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='CleaningChecklistStepImages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='checklist_step_images/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cleaning_checklist_step', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='spotless.cleaningcheckliststep')),
            ],
        ),
        migrations.AddField(
            model_name='cleaningschedule',
            name='cleaner',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
    ]
