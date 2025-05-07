import joblib
import requests
from bs4 import BeautifulSoup
import re

# Load trained model
model = joblib.load("../Model/model.pkl")

# Text Preprocessing Function (Ensure it's the same as in model training)
def clean_text(text):
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)  # Remove URLs
    text = re.sub(r'<.*?>', '', text)  # Remove HTML tags
    text = re.sub(r'[^a-z\s]', '', text)  # Remove special characters
    return text

# Function to Predict Fake/Real News
def predict_news(text):
    processed_text = clean_text(text)
    prediction = model.predict([processed_text])
    return "Fake News" if prediction[0] == 0 else "Real News"

def fetch_indian_news():
    news_sources = {
        "https://timesofindia.indiatimes.com/india": "span.w_tle",
        "https://indianexpress.com/section/india/": "h2",
        "https://www.hindustantimes.com/india-news": "h3"
    }

    news_list = []
    for url, tag in news_sources.items():
        try:
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                articles = soup.select(tag)
                news_list.extend([article.text.strip() for article in articles if article.text.strip()])
        except Exception as e:
            print(f"Error fetching from {url}: {e}")

    return news_list[:5] if news_list else ["No news found."]

NEWSAPI_KEY = "662374efc59248688e69260f770e9695"

def fetch_newsapi_news(query="latest"):
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWSAPI_KEY}"
    
    try:
        response = requests.get(url).json()
        return [article["title"] + " " + article["description"] for article in response.get("articles", []) if article["description"]]
    except Exception as e:
        print("Error fetching from NewsAPI:", e)
        return []

NEWSDATA_KEY = "pub_72722c3d644a092ad8bc642654c15e0035907"

def fetch_newsdata_news(query="latest"):
    url = f"https://newsdata.io/api/1/news?q={query}&apikey={NEWSDATA_KEY}"
    
    try:
        response = requests.get(url).json()
        return [article["title"] + " " + article["description"] for article in response.get("results", []) if article["description"]]
    except Exception as e:
        print("Error fetching from NewsData.io:", e)
        return []

def fetch_and_predict_news(query="latest"):
    # Fetch news from all sources using query
    news_list = fetch_indian_news() + fetch_newsapi_news(query) + fetch_newsdata_news(query)
    
    # Predict Fake/Real for each news article
    predictions = [predict_news(article) for article in news_list]

    return {"news": news_list, "predictions": predictions}

