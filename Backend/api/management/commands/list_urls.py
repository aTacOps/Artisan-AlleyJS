from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = "Lists all registered URLs in the project"

    def handle(self, *args, **options):
        resolver = get_resolver()
        urls = resolver.url_patterns
        for url in urls:
            self.print_pattern(url)

    def print_pattern(self, pattern, prefix=""):
        if hasattr(pattern, 'url_patterns'):  # If it's a Resolver
            for sub_pattern in pattern.url_patterns:
                self.print_pattern(sub_pattern, prefix + pattern.pattern.regex.pattern)
        else:
            self.stdout.write(f"{prefix}{pattern.pattern.regex.pattern}")
