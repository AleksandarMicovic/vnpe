from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import get_object_or_404, render, redirect
from django_socketio import broadcast, broadcast_channel, NoSocket

def room(request, room):
	return render(request, "home.html")

def welcome(request):
	return render(request, "welcome.html")
