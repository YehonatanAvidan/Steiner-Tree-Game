let actionHistory = []; // List to store the actions for undo/redo
const cookieName = 'user_hash';
let hash = getCookie(cookieName);

function clearActionHistory() {
    actionHistory = [];
}


function updateActionHistory() {
    current_time = new Date().getTime();
    actionHistory.push({ points: points.map(p => ({ ...p })), connections: [...connections], 
        totalLength, time: current_time });
}
// Submit the score and action history to the server
function submitHistory() {
    fetch('/submit-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            actionHistory: actionHistory,
            userHash: hash
        })
    }).then(response => response.json()).then(data => {
        console.log('Score submitted:', data);
    }).catch(error => {
        console.error('Error submitting score:', error);
    });
}
function generateRandomHash(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function setCookie(name, value, days) {
    const expires = `expires=${new Date(Date.now() + days * 864e5).toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}


function checkOrCreateHash() {
    hash = getCookie(cookieName);
    
    if (!hash) {
        hash = generateRandomHash();
        setCookie(cookieName, hash, 7);
        console.log("New hash created and stored:", hash);
    } else {
        console.log("Existing hash found:", hash);
    }
}
document.addEventListener('DOMContentLoaded', checkOrCreateHash);




