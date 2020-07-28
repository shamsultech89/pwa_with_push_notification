const applicationServerPublicKey = 'BCW6JPG-T7Jx0bYKMhAbL6j3DL3VTTib7dwvBjQ' +
  'C_496a12auzzKFnjgFjCsys_YtWkeMLhogfSlyM0CaIktx7o';

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateBtn(pushButton) {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}


function updateSubscriptionOnServer(subscription, endpoint = '', product_id = '') {
  // TODO: Send subscription to application server

  if(endpoint != '') {
    json_string = { endpoint: endpoint };
  }
  else{
    json_string = { subscription, product_id: product_id };
  }

  var subscribeRequest = new Request('/home/subscribe');
  fetch(subscribeRequest, {
    credentials: 'include',
    headers: formHeaders(),
    method: 'POST',
    body: JSON.stringify(json_string)
  })

  if (product_id != '') {
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      subscriptionDetails.classList.remove('is-invisible');
    } else {
      subscriptionDetails.classList.add('is-invisible');
    }
  }
}

function subscribeUser(pushButton, product_id = '') {
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: window.vapidPublicKey
  })
  .then(function(subscription) {
    console.log('User is subscribed');
    isSubscribed = true;
    updateSubscriptionOnServer(subscription,'' , product_id);


    updateBtn(pushButton);
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn(pushButton);
  });
}

function unsubscribeUser(pushButton) {
  endpoint = ''
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      endpoint = subscription['endpoint']
      subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function(successful) {
    updateSubscriptionOnServer(null, endpoint);

    console.log('User is unsubscribed.', successful);
    isSubscribed = false;

    updateBtn(pushButton);
  });
}

function initializeUI() {
  pushButton = document.querySelector('.js-push-btn')
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser(pushButton);
    } else {
      var product_id = pushButton.getAttribute('data-product_id');
      subscribeUser(pushButton, product_id);
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn(pushButton);
  });
}




function getSubscription() {
  return navigator.serviceWorker.ready
  .then((serviceWorkerRegistration) => {
    return serviceWorkerRegistration.pushManager.getSubscription()
    .catch((error) => {
      console.log('Error during getSubscription()', error);
    });
  });
}


// Send notification on button click

function sendNotification(product_id = '') {
  getSubscription().then((subscription) => {
    return fetch("/home/push", {
      headers: formHeaders(),
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ subscription: subscription.toJSON(), product_id: product_id })
    }).then((response) => {
      console.log("Push response", response);
      if (response.status >= 500) {
        console.log(response.statusText);
        alert("Sorry, there was a problem sending the notification. Try resubscribing to push messages and resending.");
      }
    })
    .catch((e) => {
      console.log("Error sending notification", e);
    });
  })
}

function formHeaders() {
  return new Headers({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': authenticityToken(),
  });
}

function authenticityToken() {
  return document.querySelector('meta[name=csrf-token]').content;
}
