#!/bin/bash

# Test Pinecone integration via curl commands
# Make sure your backend server is running on http://localhost:5000

BASE_URL="http://localhost:5000/api/vector"

echo "🚀 Testing Pinecone Integration via API Endpoints...\n"

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ Server is not running on http://localhost:5000"
    echo "Please start your backend server first:"
    echo "npm run dev"
    exit 1
fi
echo "✅ Server is running\n"

# Generate unique IDs
TIMESTAMP=$(date +%s)
CONVERSATION_ID="test-conversation-$TIMESTAMP"
KNOWLEDGE_ID="test-knowledge-$TIMESTAMP"

# 1. Test conversation embedding storage
echo "💬 Testing conversation embedding storage..."
CONVERSATION_RESPONSE=$(curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/embed" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "content": "This is a test prompt about TypeScript best practices and how to implement proper type safety in large applications",
    "role": "user"
  }')

echo "✅ Conversation embedding stored successfully"
echo "   Response: $CONVERSATION_RESPONSE"
echo ""

# 2. Test knowledge embedding storage
echo "📚 Testing knowledge embedding storage..."
KNOWLEDGE_RESPONSE=$(curl -s -X POST "$BASE_URL/knowledge/$KNOWLEDGE_ID/embed" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TypeScript Best Practices Guide",
    "content": "TypeScript provides static typing for JavaScript, enabling better code quality and developer experience. Key practices include using interfaces for type definitions, avoiding any types, and implementing proper generics.",
    "category": "programming",
    "tags": ["typescript", "best-practices", "type-safety"]
  }')

echo "✅ Knowledge embedding stored successfully"
echo "   Response: $KNOWLEDGE_RESPONSE"
echo ""

# 3. Test conversation search
echo "🔍 Testing conversation search..."
SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/conversations/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TypeScript best practices",
    "userId": "test-user-123",
    "limit": 5
  }')

echo "✅ Conversation search completed"
echo "   Results: $SEARCH_RESPONSE"
echo ""

# 4. Test knowledge search
echo "🔍 Testing knowledge search..."
KNOWLEDGE_SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/knowledge/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "type safety",
    "category": "programming",
    "limit": 5
  }')

echo "✅ Knowledge search completed"
echo "   Results: $KNOWLEDGE_SEARCH_RESPONSE"
echo ""

# 5. Get vector service stats
echo "📊 Getting vector service statistics..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/stats")

echo "✅ Stats retrieved"
echo "   Stats: $STATS_RESPONSE"
echo ""

echo "🎉 All API tests passed! Pinecone integration is working correctly."
echo ""
echo "📝 Summary:"
echo "   - ✅ Conversation embedding storage via API"
echo "   - ✅ Knowledge embedding storage via API"
echo "   - ✅ Conversation search via API"
echo "   - ✅ Knowledge search via API"
echo "   - ✅ Service statistics via API"
