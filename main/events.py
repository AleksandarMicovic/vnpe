from django.shortcuts import get_object_or_404
from django.utils.html import strip_tags
from django_socketio import events, broadcast_channel, send
import django_socketio

@events.on_message(channel="^.*$")
def testing(reqest, socket, context, message):
	to_send = {
		"id" : socket.session.session_id,
		"type" : "new_object",
		"object" : message['object'],
		"channel" : message['room']
	}

	broadcast_channel(to_send, channel=message['room'])

@events.on_subscribe(channel="^.*$")
def testing2(request, socket, context, channel):
	to_send = {
		'id':socket.session.session_id, 
		'type':"connection"
	}

	print "someone connected"
	broadcast_channel(to_send, channel=channel)
