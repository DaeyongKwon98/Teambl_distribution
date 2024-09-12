from collections import deque
from .models import Friend
from django.db.models import Q


def get_user_distance(user, target_user):
    """BFS를 사용하여 user와 target_user 사이의 촌수를 계산합니다."""
    """Target_user와의 거리가 4촌 이상인 경우 None을 return"""

    queue = deque([(user, 0)])
    visited = {user}

    while queue:
        current_user, distance = queue.popleft()

        # 촌수가 3을 넘어가는 경우 종료.
        if distance > 3:
            break

        if current_user == target_user:
            return distance

        friends = Friend.objects.filter(
            (Q(from_user=current_user) & Q(status="accepted"))
            | (Q(to_user=current_user) & Q(status="accepted"))
        )

        for friend in friends:
            friend_user = (
                friend.to_user if friend.from_user == current_user else friend.from_user
            )
            if friend_user not in visited:
                visited.add(friend_user)
                queue.append((friend_user, distance + 1))

    return None  # target_user를 3촌 이내에 찾지 못한 경우
