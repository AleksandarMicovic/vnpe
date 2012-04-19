from django.conf.urls.defaults import *

urlpatterns = patterns("main.views",
	url("^room/([a-zA-Z1-9]*)$", "room", name="home"),
	url("^$", "welcome", name="welcome"),
)
