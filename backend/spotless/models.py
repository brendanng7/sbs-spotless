from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.urls import reverse

# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    name = models.CharField(max_length=70)
    email = models.CharField(max_length=250, unique=True)
    password = models.CharField(max_length=100)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()