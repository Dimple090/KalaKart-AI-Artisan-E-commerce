const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyC7MtasEyTDs7Whjg7qrkqIWWu_8S0t03Q');
async function run() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC7MtasEyTDs7Whjg7qrkqIWWu_8S0t03Q`);
        const data = await response.json();
        console.log(data.models.map(m => m.name));
    } catch(e) { console.error(e); }
}
run();
