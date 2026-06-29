"""
Content models for Elite MRCOG.
Hierarchy: Part → Module → ReadingArticle → Station (PDF-based)
                         └→ Video (embed URL only)

PDFs are served via a protected endpoint — never via static/media URL.
No downloadable content.
"""

from django.db import models
from django.conf import settings


class Part(models.Model):
    """MRCOG exam parts: Part 1, Part 2, Part 3."""
    name = models.CharField(max_length=100, unique=True)  # e.g. "Part 3"
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Part'
        verbose_name_plural = 'Parts'

    def __str__(self):
        return self.name


class Module(models.Model):
    """A learning module belonging to a Part."""

    class Category(models.TextChoices):
        EASY_READ = 'easy_read', 'Easy Read'
        COURSE_MATERIAL = 'course_material', 'Course Material'

    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.COURSE_MATERIAL,
        help_text="Easy Read or Course Material"
    )
    is_free = models.BooleanField(
        default=False,
        help_text="If true, this module is accessible without a subscription"
    )
    # Short preview text (shown on hover card / list view)
    short_text = models.CharField(max_length=500, help_text="Brief description (shown on card hover)")
    # Long rich text (shown in module detail page)
    long_text = models.TextField(help_text="Full description (rich text, shown on module detail page)")
    thumbnail = models.ImageField(upload_to='modules/thumbnails/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    tags = models.CharField(max_length=255, blank=True, help_text='Comma-separated tags, e.g. "MRCOG High Yield,Exam relevant"')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Module'
        verbose_name_plural = 'Modules'

    def __str__(self):
        return f"{self.part.name} — [{self.get_category_display()}] {self.title}"

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class ReadingArticle(models.Model):
    """An article in the Reading Library. Groups multiple stations (PDF lessons)."""

    class ArticleType(models.TextChoices):
        EASY_READ = 'easy_read', 'Easy Read'
        COURSE_MATERIAL = 'course_material', 'Course Material'

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=255)
    article_type = models.CharField(max_length=20, choices=ArticleType.choices, default=ArticleType.COURSE_MATERIAL)
    thumbnail = models.ImageField(upload_to='articles/thumbnails/', blank=True, null=True)
    # Short text shown in card/hover popup
    short_description = models.CharField(max_length=500)
    # Intro text shown at top of the module detail page
    overview_text = models.TextField(
        help_text="Extended description shown on the module detail page",
        blank=True
    )
    duration_display = models.CharField(max_length=20, blank=True, help_text='e.g. "5h 18m"')
    is_free = models.BooleanField(default=False, help_text="Freely accessible without subscription")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Reading Article'
        verbose_name_plural = 'Reading Articles'

    def __str__(self):
        return f"[{self.get_article_type_display()}] {self.title}"

    @property
    def station_count(self):
        return self.stations.count()


class Station(models.Model):
    """
    A lesson (station) within a ReadingArticle.
    Content is a PDF file served inline only — never downloadable.
    Tracks user progress per page.
    """
    article = models.ForeignKey(ReadingArticle, on_delete=models.CASCADE, related_name='stations')
    title = models.CharField(max_length=255)
    # PDF stored server-side; served via protected view, never as a direct URL
    pdf_file = models.FileField(
        upload_to='stations/pdfs/',
        blank=True, null=True,
        help_text="Upload the PDF for this station. Will be served inline — not downloadable."
    )
    page_count = models.PositiveIntegerField(
        default=1,
        help_text="Total number of pages in the PDF. Set this after uploading."
    )
    order = models.PositiveIntegerField(default=0)
    # First station is always free preview
    is_free = models.BooleanField(default=False, help_text="Free preview station (first station should be free)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Station'
        verbose_name_plural = 'Stations'

    def __str__(self):
        return f"{self.article.title} — Station {self.order:02d}: {self.title}"


class Video(models.Model):
    """
    A video in the Video Library.
    Stored as embed_url (YouTube/Vimeo) only — no direct file download.
    """
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    thumbnail = models.ImageField(upload_to='videos/thumbnails/', blank=True, null=True)
    # YouTube/Vimeo embed URL (optional)
    embed_url = models.URLField(
        blank=True, null=True,
        help_text="YouTube or Vimeo embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)."
    )
    # Direct video file upload
    video_file = models.FileField(
        upload_to='videos/files/',
        blank=True, null=True,
        help_text="Upload video file directly. Max 100MB."
    )
    duration_display = models.CharField(max_length=20, blank=True, help_text='e.g. "9h 18m"')
    # Short text shown on hover card
    short_description = models.CharField(max_length=500, blank=True)
    # Longer description shown on detail page
    long_description = models.TextField(blank=True, help_text="Full description (rendered in browser)")
    is_free = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Video'
        verbose_name_plural = 'Videos'

    def __str__(self):
        return f"{self.module.part.name} — {self.title}"


class UserProgress(models.Model):
    """Tracks which stations a user has been reading and how far through the PDF."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='user_progress')
    current_page = models.PositiveIntegerField(default=1, help_text="Last page the user was reading")
    progress_percent = models.PositiveIntegerField(default=0, help_text="0-100, auto-calculated from page progress")
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'station')
        verbose_name = 'User Progress'
        verbose_name_plural = 'User Progress'

    def __str__(self):
        return f"{self.user} — {self.station.title}: {self.progress_percent}% (page {self.current_page})"

    @property
    def is_complete(self):
        return self.progress_percent >= 100


class UserVideoProgress(models.Model):
    """Tracks which videos a user has been watching and their progress."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_progress')
    current_time = models.FloatField(default=0.0, help_text="Last watched time in seconds")
    progress_percent = models.PositiveIntegerField(default=0, help_text="0-100, auto-calculated from video length")
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'video')
        verbose_name = 'User Video Progress'
        verbose_name_plural = 'User Video Progress'

    def __str__(self):
        return f"{self.user} — {self.video.title}: {self.progress_percent}% (time {self.current_time}s)"

    @property
    def is_complete(self):
        return self.progress_percent >= 100


class Testimonial(models.Model):
    """
    Student testimonials and success stories.
    Managed via admin panel and displayed dynamically on the frontend.
    """
    student_name = models.CharField(max_length=255)
    exam_passed = models.CharField(max_length=255, blank=True, help_text="e.g. 'Passed Part 3'")
    quote = models.TextField()
    rating = models.PositiveIntegerField(default=5, help_text="1 to 5 stars")
    photo = models.ImageField(upload_to='testimonials/photos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f"{self.student_name} ({self.exam_passed})"
