from django.db import models


class ContentType(models.Model):

    CONTENT_TYPES = (
        ('', 'Web Page'),
        ('App', 'Application'),
        ('Blog', 'Blog'),
        ('Mot', 'Motivational'),
        ('VL', 'Video Lecture'),
    )
    name = models.CharField(max_length=10,
                            choices=CONTENT_TYPES,
                            default='')


class Resource(models.Model):

    link = models.URLField()
    title = models.CharField(max_length=100)

    subject_tags = models.ManyToManyField('SubjectTag')
    content_types = models.ManyToManyField('ContentType')


class SubjectTag(models.Model):

    parent = models.ForeignKey('SubjectTag', blank=True, null=True)
    name = models.CharField(max_length=100)

    thumbnail = models.ImageField(upload_to='subject_thumbnails/')

