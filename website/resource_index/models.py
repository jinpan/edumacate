from django.db import models


class ContentType(models.Model):

    name = models.CharField(max_length=100,
                            default='Web Page')


class Resource(models.Model):

    link = models.URLField()
    title = models.CharField(max_length=100)

    subject_tags = models.ManyToManyField('SubjectTag')
    content_types = models.ManyToManyField('ContentType')


class SubjectTag(models.Model):

    parent = models.ForeignKey('SubjectTag', blank=True, null=True)
    name = models.CharField(max_length=100)

    thumbnail = models.ImageField(upload_to='models/subject_thumbnails/')

