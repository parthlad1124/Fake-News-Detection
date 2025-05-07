document.addEventListener("DOMContentLoaded", function () {
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const resultDiv = document.getElementById("result");
    const newsQueryInput = document.getElementById("newsQuery");  // Input for real-time news query
    const newsList = document.getElementById("newsList");

    //  Send News for Fake/Real Prediction
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText) {
            alert("Please enter news content.");
            return;
        }

        const messageElement = document.createElement("div");
        messageElement.className = "message";
        messageElement.innerHTML = `<p>${messageText}</p>`;

        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        messageInput.value = "";

        // Send data to Flask backend for Fake News Detection
        fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: messageText })
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.innerHTML = `<p><strong>Prediction:</strong> ${data.prediction}</p>`;
        })
        .catch(error => {
            console.error("Error:", error);
            resultDiv.innerHTML = "<p style='color: red;'>❌ Failed to get a response from the server.</p>";
        });
    }

    //  Fetch Real-Time News Based on User Query
    function fetchNews() {
        let query = newsQueryInput.value.trim() || "latest"; // Get user input, default is "latest"
        
        fetch(`/fetch_news?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            newsList.innerHTML = "";  // Clear previous news

            data.news.forEach((article, index) => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${index + 1}.</strong> ${article} <br>
                    <span style="color: ${data.predictions[index] === 'Fake News' ? 'red' : 'green'};">
                        ${data.predictions[index]}
                    </span>`;
                newsList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching news:", error));
    }

    //  Handle File Attachment
    function handleAttach() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*,application/pdf";
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const messageElement = document.createElement("div");
                messageElement.className = "message";
                if (file.type.startsWith("image")) {
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(file);
                    img.style.maxWidth = "200px";
                    img.style.borderRadius = "8px";
                    messageElement.appendChild(img);
                } else {
                    messageElement.innerHTML = `<p class="file">📎 ${file.name}</p>`;
                }
                messagesDiv.appendChild(messageElement);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        };
        fileInput.click();
    }

    // Logout User
    function logout() {
        window.location.href = "/";  // Redirect to login page
    }

    // Make functions accessible globally
    window.sendMessage = sendMessage;
    window.fetchNews = fetchNews;
    window.handleAttach = handleAttach;
    window.logout = logout;
});
