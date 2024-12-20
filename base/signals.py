from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from base.models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created and not instance.is_staff:  # Exclude admin users
        Profile.objects.get_or_create(user=instance)

