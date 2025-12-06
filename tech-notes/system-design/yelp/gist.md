---
title: "Yelp"
description: "System design for a local business search and review platform"
---

# Yelp System Design

## Overview
Yelp is an online platform for searching, reviewing, and discovering local businesses, restaurants, and services.

---

## Functional Requirements

### Core Requirements
- ✅ Users can search for businesses by name, location (lat/long), and category
- ✅ Users can view businesses and their reviews
- ✅ Users can leave reviews on businesses (1-5 star rating + optional text)

### Out of Scope
- Admin business management (add/update/remove)
- Map-based business viewing
- Personalized business recommendations

---

## Non-Functional Requirements

### Core Requirements
- **Low Latency**: Search operations < 500ms
- **High Availability**: Eventual consistency is acceptable
- **Scalability**: Support 100M daily users and 10M businesses

### Out of Scope
- GDPR compliance and data protection
- Fault tolerance mechanisms
- Spam and abuse prevention systems

---

## Constraints
- Each user can only leave **one review per business**

---

## Core Entities

### Business
Represents a listed business or service
- Business ID
- Name
- Location (lat/long)
- Category
- Average rating
- Description

### User
Represents a Yelp user
- User ID
- Name
- Email
- Profile information

### Review
Represents a user's review of a business
- Review ID
- User ID
- Business ID
- Rating (1-5 stars)
- Text (optional)
- Timestamp

---

## API Design

### Search for Businesses
```http
GET /businesses?query={term}&location={lat,long}&category={category}&page={n}
Response: Business[]
```

### View Business Details
```http
GET /businesses/:businessId
Response: Business
```

### View Business Reviews
```http
GET /businesses/:businessId/reviews?page={n}
Response: Review[]
```

### Leave a Review
```http
POST /businesses/:businessId/reviews
Body: {
  rating: number,
  text?: string
}
Response: Review
```

---

## High-Level Architecture

### Components

1. **Client**: Web or mobile application
2. **API Gateway**: Routes requests to appropriate services
3. **Business Service**: Handles search and business viewing
4. **Review Service**: Manages review creation and retrieval
5. **Database**: Stores businesses and reviews
6. **Read Replicas**: Scale read operations
7. **Cache Layer**: Improve read performance

### Data Flow

#### Search Flow
```
Client → API Gateway → Business Service → Database → Response
```

#### View Business Flow
```
Client → API Gateway → Business Service → DB (join businesses + reviews) → Response
```

#### Leave Review Flow
```
Client → API Gateway → Review Service → Database → Response
```

---

## Deep Dives

### 1. Calculating Average Ratings Efficiently

**Challenge**: Computing average ratings on-the-fly is inefficient

**Solution**: Pre-compute and store ratings
```sql
-- Store in business table
avg_rating DECIMAL(3,2)
num_reviews INTEGER

-- Update on review insert
UPDATE businesses
SET avg_rating = ((avg_rating * num_reviews) + new_rating) / (num_reviews + 1),
    num_reviews = num_reviews + 1
WHERE business_id = ?
```

**Key Insight**: With only ~1 write/second (100k writes/day), no need for message queues. Simple transactional updates suffice.

**Optimistic Locking**:
```sql
UPDATE businesses
SET avg_rating = ...,
    num_reviews = num_reviews + 1,
    version = version + 1
WHERE business_id = ? AND version = ?
```

---

### 2. One Review Per Business Constraint

**Options**:

#### Option 1: Database Constraint (Recommended)
```sql
CREATE UNIQUE INDEX idx_user_business 
ON reviews(user_id, business_id);
```

#### Option 2: Application-Level Check
```sql
-- Before insert
SELECT COUNT(*) FROM reviews 
WHERE user_id = ? AND business_id = ?;
```

#### Option 3: Upsert Pattern
```sql
INSERT INTO reviews (user_id, business_id, rating, text)
VALUES (?, ?, ?, ?)
ON CONFLICT (user_id, business_id)
DO UPDATE SET rating = ?, text = ?, updated_at = NOW();
```

**Best Practice**: Enforce at persistence layer for data consistency

---

### 3. Optimizing Complex Search Queries

**Problem**: Inefficient queries with lat/long and text search
```sql
-- ❌ SLOW - Full table scan
SELECT * FROM businesses 
WHERE latitude > 10 AND latitude < 20 
  AND longitude > 10 AND longitude < 20
  AND name LIKE '%coffee%';
```

**Solution**: Use Elasticsearch or Geospatial Indexing

#### Option 1: Elasticsearch (Recommended)
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "coffee" } },
        { "term": { "category": "restaurant" } }
      ],
      "filter": {
        "geo_distance": {
          "distance": "5km",
          "location": { "lat": 40.7, "lon": -74.0 }
        }
      }
    }
  }
}
```

#### Option 2: Database Geospatial Indexes

**Quadtrees vs Geohashing**:
- **Quadtrees**: Better for clustered data (cities), infrequent updates
- **Geohashing**: Better for uniformly distributed data, frequent updates

**For Yelp**: Use **Quadtrees** (businesses cluster in cities, rare updates)

**Search Process**:
1. Apply geospatial filter (most restrictive)
2. Calculate exact distance (Haversine formula)
3. Apply text/category filters on reduced set
4. Return paginated results

---

### 4. Search by Location Names (Cities/Neighborhoods)

**Challenge**: Support searches like "Pizza in Mission District"

**Solution**: Polygon-based location matching

#### Step 1: Location to Polygon Mapping
```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- 'city', 'neighborhood', 'state'
  polygon GEOMETRY(POLYGON, 4326)
);

CREATE INDEX idx_location_name ON locations(name);
```

#### Step 2: Pre-compute Business Locations
```json
{
  "id": "123",
  "name": "Pizza Place",
  "location_names": ["bay_area", "san_francisco", "mission_district"],
  "category": "restaurant",
  "location": { "lat": 37.76, "lon": -122.42 }
}
```

#### Step 3: Query by Location Name
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "location_names": "mission_district" } },
        { "match": { "name": "pizza" } }
      ]
    }
  }
}
```

**Benefits**:
- Avoids runtime polygon containment checks
- Uses inverted index for fast lookups
- Computed once at business creation

---

## Scaling Considerations

### Read:Write Ratio
- **1000:1 ratio** (100M searches/day vs 100k reviews/day)
- Optimize heavily for reads

### Scaling Strategies

#### Database
- **Read Replicas**: Handle search load
- **Caching**: Redis for hot businesses
- **Sharding**: Not needed (1TB data easily fits single DB)

#### Business Service
- Horizontally scale for search traffic
- Load balancer distribution

#### Review Service
- Lighter scaling needs
- Separate from business service due to different usage patterns

---

## Technology Stack

### Recommended
- **Database**: PostgreSQL (with PostGIS extension)
- **Search**: Elasticsearch
- **Cache**: Redis
- **API Gateway**: Kong/AWS API Gateway
- **Load Balancer**: Nginx/AWS ALB

### Alternative (Simpler)
- **Database**: PostgreSQL only (with PostGIS)
- **Cache**: Redis
- No separate search service

---

## Data Estimates

### Scale
- 10M businesses
- 100 reviews/business average
- 1B total reviews
- ~1TB total data

### Traffic
- 100M daily active users
- ~1000 searches per second (peak)
- ~1 review per second
- Read:Write = 1000:1

---

## Key Design Principles

### Staff+ Level Insights
1. **Simplicity over Complexity**: 1 write/sec doesn't need message queues
2. **Single Database**: 1TB fits easily, no need for separate review DB
3. **Read Replicas Sufficient**: No sharding needed at this scale
4. **Constraint at Persistence**: Unique index for one-review-per-business
5. **Pre-compute Locations**: Avoid runtime polygon checks

### Anti-Patterns to Avoid
- ❌ Over-engineering with message queues for tiny write volume
- ❌ Premature sharding when data fits single instance
- ❌ Separate database per microservice dogma
- ❌ Runtime calculation of average ratings
- ❌ Application-level constraint enforcement
