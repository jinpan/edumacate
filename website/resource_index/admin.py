from django.contrib import admin

from resource_index.models import ContentType
from resource_index.models import Resource
from resource_index.models import SubjectTag

admin.site.register(ContentType)
admin.site.register(Resource)
admin.site.register(SubjectTag)

