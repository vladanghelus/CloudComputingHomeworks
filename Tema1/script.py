import threading
import urllib.request

def thread_function(url):
    response = urllib.request.urlopen(url)

for j in range(1, 5):
    for i in range(1, 5):
        thread1 = threading.Thread(target=thread_function, args=('http://localhost:8080/final',))
        thread1.start()