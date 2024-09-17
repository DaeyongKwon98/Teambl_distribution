import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import InvitationLink

# 로그 설정
logging.basicConfig(
    filename='/mnt/c/Users/User/Desktop/TeamBL/develop/Teambl_Backend/expire_links.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
)

class Command(BaseCommand):
    help = 'Expire invitation links that are older than the specified time'

    def handle(self, *args, **options):
        expiration_time = timezone.now() - timezone.timedelta(minutes=1)
        expired_links = InvitationLink.objects.filter(created_at__lt=expiration_time, status='pending')
        expired_count = expired_links.count()
        expired_links.update(status='expired')
        logging.info(f'Successfully expired {expired_count} links')
        self.stdout.write(self.style.SUCCESS(f'Successfully expired {expired_count} links'))