from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ProjectImage
import os
from django.conf import settings

@receiver(post_delete, sender=ProjectImage)
def delete_image_file(sender, instance, **kwargs):
    # 인스턴스에 이미지 파일이 있을 경우
    if instance.image:
        image_path = instance.image.path  # 이미지 파일 경로
        # 이미지 파일이 존재하는지 확인 후 삭제
        if os.path.isfile(image_path):
            os.remove(image_path)
