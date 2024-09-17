# from celery import shared_task
# from django.utils import timezone
# from datetime import timedelta
# from .models import CustomUser

# @shared_task
# def update_user_statistics():
#     users = CustomUser.objects.all()
#     for user in users:
#         # 통계 테이블 가져오기 (없으면 생성)
#         statistics, created = UserStatistics.objects.get_or_create(user=user)

#         # 기존 값들을 이전 값으로 저장
#         statistics.two_degree_count_prev = statistics.two_degree_count_now
#         statistics.same_keyword_count_prev = statistics.same_keyword_count_now

#         # 2촌 수 업데이트
#         _, second_degree_ids, _ = user.get_friend_counts()
#         statistics.two_degree_count_now = len(second_degree_ids)
        
#         # 키워드 겹치는 유저 수 업데이트
#         related_users = user.get_related_users_by_keywords()
#         statistics.same_keyword_count_now = len(related_users)

#         # 업데이트 시간 갱신
#         statistics.updated_at = timezone.now()

#         # 저장
#         statistics.save()

