#!/bin/bash

# Insert test record into Pinecone
echo "🚀 Inserting test record into Pinecone..."

TIMESTAMP=$(date +%s)
ISO_DATE=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

curl -X POST https://52b6411f-54b4-4add-a927-674955b620a5.svc.apw5-4e7b-81fa.pinecone.io/vectors/upsert \
  -H "Api-Key: pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": [
      {
        "id": "test-conversation-'"$TIMESTAMP"'",
        "values": [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8],
        "metadata": {
          "timestamp": "'"$ISO_DATE"'",
          "source": "test",
          "type": "conversation",
          "userId": "test-user-123",
          "content": "This is a test conversation about TypeScript best practices"
        }
      }
    ]
  }'

echo ""
echo "✅ Insert command executed!"
echo "📱 Check your Pinecone dashboard: https://app.pinecone.io/organizations/-Os2XLB63XxOUK4K_0gL/projects/52b6411f-54b4-4add-a927-674955b620a5/indexes/automind-conversations/browser"
echo "   You should see a new record with ID starting with 'test-conversation-'"
