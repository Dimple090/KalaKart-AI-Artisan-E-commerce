from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="KalaKart AI Service", description="ML microservice for e-commerce features")

# Mock database - in a real app, we'd query MongoDB
MOCK_PRODUCTS = [
    {"id": "p1", "name": "Hand-painted Blue Pottery Vase", "category": "Home Decor", "price": 45},
    {"id": "p2", "name": "Woven Bamboo Basket", "category": "Home Decor", "price": 25},
    {"id": "p3", "name": "Silver Filigree Earrings", "category": "Jewelry", "price": 60},
    {"id": "p4", "name": "Terracotta Coffee Mug", "category": "Home Decor", "price": 15},
    {"id": "p5", "name": "Brass Necklace Traditional", "category": "Jewelry", "price": 55},
    {"id": "p6", "name": "Embroidered Silk Scarf", "category": "Textiles", "price": 35},
]

class ProductInteraction(BaseModel):
    product_id: str
    user_id: str

class ProductFeatures(BaseModel):
    category: str
    material_cost: float
    labor_hours: float

@app.get("/")
def root():
    return {"message": "AI Service is running"}

@app.get("/api/recommendations/{product_id}")
def get_recommendations(product_id: str):
    """
    Returns content-based recommendations based on product name and category similarity.
    Uses TF-IDF and Cosine Similarity.
    """
    try:
        df = pd.DataFrame(MOCK_PRODUCTS)
        # Create a combined 'content' string for each product
        df['features'] = df['name'] + " " + df['category']
        
        # Calculate TF-IDF
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df['features'])
        
        # Calculate Cosine Similarity
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        # Find index of requested product
        if product_id not in df['id'].values:
            return {"recommendations": MOCK_PRODUCTS[:3]} # Fallback
            
        idx = df.index[df['id'] == product_id].tolist()[0]
        
        # Get similar scores
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top 3 similar (excluding itself)
        sim_scores = sim_scores[1:4]
        product_indices = [i[0] for i in sim_scores]
        
        recommendations = df.iloc[product_indices][['id', 'name', 'price', 'category']].to_dict('records')
        return {"recommendations": recommendations}
        
    except Exception as e:
        print(f"Error: {str(e)}")
        # Graceful fallback
        return {"recommendations": MOCK_PRODUCTS[:3]}

@app.post("/api/predict-price")
def predict_price(features: ProductFeatures):
    """
    Simple heuristic/ML mockup for price prediction 
    based on material, labor, and category multipliers.
    """
    base_cost = features.material_cost + (features.labor_hours * 15.0) # $15/hr labor assumption
    
    # Category perceived value multipliers
    multipliers = {
        "Jewelry": 2.5,
        "Art": 3.0,
        "Home Decor": 1.8,
        "Textiles": 2.2,
        "Pottery": 2.0
    }
    
    multiplier = multipliers.get(features.category, 1.5)
    
    suggested_price = base_cost * multiplier
    
    # Add a slight randomized noise to simulate ML variation (+/- 5%)
    noise = np.random.uniform(0.95, 1.05)
    final_price = round(suggested_price * noise, 2)
    
    return {
        "suggested_price": final_price,
        "confidence": 0.85,
        "breakdown": {
            "base_cost": base_cost,
            "category_premium": round((multiplier - 1) * 100, 1)
        }
    }
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
