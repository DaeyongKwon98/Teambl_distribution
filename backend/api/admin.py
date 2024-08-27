from django.contrib import admin
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from .tasks import update_user_statistics

# 이 코드는 Celery Beat에 주기적인 작업을 추가하는 예시입니다.
# 이를 통해 10분마다 update_user_statistics 작업이 실행됩니다.
def setup_periodic_tasks():
    schedule, created = IntervalSchedule.objects.get_or_create(
        every=10,
        period=IntervalSchedule.MINUTES,  # 일주일마다 실행
    )

    # PeriodicTask를 생성하여 매 10분마다 실행되도록 설정
    PeriodicTask.objects.get_or_create(
        interval=schedule, 
        name='Regular Update User Statistics', 
        task='api.tasks.update_user_statistics',  # Celery 작업의 경로
    )

# 앱이 로드될 때 주기적 작업을 설정
# setup_periodic_tasks()
