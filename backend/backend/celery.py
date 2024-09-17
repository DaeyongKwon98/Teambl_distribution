# from __future__ import absolute_import, unicode_literals
# import os
# from celery import Celery

# # Django의 기본 settings 모듈을 Celery가 사용할 수 있도록 설정합니다.
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# app = Celery('backend')

# # 여기에 문자열로 설정을 정의하여 Celery가 직렬화할 수 있게 합니다.
# app.config_from_object('django.conf:settings', namespace='CELERY')

# # Django 프로젝트에 등록된 모든 task 모듈을 로드합니다.
# app.autodiscover_tasks()

# @app.task(bind=True)
# def debug_task(self):
#     print(f'Request: {self.request!r}')
