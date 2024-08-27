import logging
from django.contrib import admin
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from .tasks import update_user_statistics

# 로깅 설정
logger = logging.getLogger(__name__)

def setup_periodic_tasks():
    logger.info("Setting up periodic tasks...")

    schedule, created = IntervalSchedule.objects.get_or_create(
        every=3,
        period=IntervalSchedule.MINUTES,
    )

    if created:
        logger.info("Created new IntervalSchedule for every 3 minutes.")
    else:
        logger.info("Using existing IntervalSchedule for every 3 minutes.")

    try:
        task, created = PeriodicTask.objects.get_or_create(
            interval=schedule, 
            name='Regular Update User Statistics', 
            task='api.tasks.update_user_statistics',
        )

        if created:
            logger.info("Created new PeriodicTask 'Regular Update User Statistics'.")
        else:
            logger.info("Using existing PeriodicTask 'Regular Update User Statistics'.")

    except PeriodicTask.DoesNotExist:
        logger.warning("PeriodicTask 'Regular Update User Statistics' already exists.")

    logger.info("Periodic tasks setup complete.")

setup_periodic_tasks()
