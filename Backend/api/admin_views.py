from django.shortcuts import render, redirect
from django.contrib import messages
from .models import User, Notification

def custom_message_view(request):
    user_ids = request.GET.get('users', '').split(',')
    users = User.objects.filter(id__in=user_ids)

    if request.method == 'POST':
        content = request.POST.get('content')
        for user in users:
            Notification.objects.create(
                recipient=user,
                content=content,
                type='custom',
                link='',
            )
        messages.success(request, "Custom messages sent successfully!")
        return redirect('/admin/auth/user/')

    return render(request, 'admin/custom_message_form.html', {'users': users})