# import logging
# from django.contrib import admin
# from django_celery_beat.models import PeriodicTask, IntervalSchedule
# from .tasks import update_user_statistics

# # 로깅 설정
# logger = logging.getLogger(__name__)

# def setup_periodic_tasks():
#     logger.info("Setting up periodic tasks...")

#     schedule, created = IntervalSchedule.objects.get_or_create(
#         every=3,
#         period=IntervalSchedule.MINUTES,
#     )

#     if created:
#         logger.info("Created new IntervalSchedule for every 3 minutes.")
#     else:
#         logger.info("Using existing IntervalSchedule for every 3 minutes.")

#     # 동일한 이름의 PeriodicTask가 존재하는지 체크하고, 있으면 삭제
#     task_exists = PeriodicTask.objects.filter(name='Regular Update User Statistics').exists()

#     if task_exists:
#         PeriodicTask.objects.filter(name='Regular Update User Statistics').delete()
#         logger.info("Deleted existing PeriodicTask 'Regular Update User Statistics'.")

#     # 새로운 PeriodicTask 생성
#     task = PeriodicTask.objects.create(
#         interval=schedule, 
#         name='Regular Update User Statistics', 
#         task='api.tasks.update_user_statistics',
#     )
#     logger.info("Created new PeriodicTask 'Regular Update User Statistics'.")

#     logger.info("Periodic tasks setup complete.")

# setup_periodic_tasks()
