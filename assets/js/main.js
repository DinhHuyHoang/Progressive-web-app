const applicationServerPublicKey =
    'BJ2X5IBfODkXOuBOTw3NxFKnkFpHov8WGebpOqs1jF-GBWqijcvvx7A1WWN2JRbjTR3-54-ZnX3MHurSvgcSZ4w'; //'<Your Public Key>';

const pushButton = document.querySelector('#click');
//const btn = document.querySelector('#click');

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

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('sw.js')
        .then(function (swReg) {
            //console.log('Service Worker is registered', swReg);

            swRegistration = swReg //swReg is object for sw register;
            const options = {
                "body": "Did you make a $1,000,000 purchase at Dr. Evil...",
                "icon": "images/ccard.png",
                "vibrate": [200, 100, 200, 100, 200, 100, 400],
                "tag": "request",
                "actions": [{
                    "action": "yes",
                    "title": "Yes",
                    "icon": "images/yes.png"
                },
                {
                    "action": "no",
                    "title": "No",
                    "icon": "images/no.png"
                }
                ]
            };
            swRegistration.showNotification("hoang", options);
            initializeUI();
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
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

function initializeUI() {
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    console.log(subscription);
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

pushButton.addEventListener('click', function () {
    pushButton.disabled = true;

    subscribeUser();
});

// navigator.mediaDevices.getUserMedia({
//     video: true
// })
//     .then(gotMedia)
//     .catch(error => console.error('getUserMedia() error:', error));

// function gotMedia(mediaStream) {
//     const mediaStreamTrack = mediaStream.getVideoTracks()[0];
//     const imageCapture = new ImageCapture(mediaStreamTrack);
//     console.log(imageCapture);

//     const img = document.querySelector('img');
//     // ...
//     imageCapture.takePhoto()
//         .then(blob => {
//             img.src = URL.createObjectURL(blob);
//             img.onload = () => {
//                 URL.revokeObjectURL(this.src);
//             }
//         })
//         .catch(error => console.error('takePhoto() error:', error));
// }