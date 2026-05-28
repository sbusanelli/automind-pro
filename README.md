# AutoMind - Autonomous AI Operations System

🤖 **AutoMind** is an advanced autonomous AI operations system that leverages vector databases, semantic similarity analysis, and intelligent automation to streamline and enhance AI-driven workflows.

## 🚀 Features

### 🧠 **Vector Database Integration**
- **Pinecone Integration**: 1024-dimensional embeddings for semantic search
- **Multi-Index Architecture**: Separate indexes for conversations, knowledge, and jobs
- **Semantic Search**: Advanced cosine similarity with 80-90%+ accuracy
- **Batch Processing**: Efficient bulk operations for large datasets

### 🔄 **Knowledge Synchronization**
- **Change Detection**: File hash-based monitoring with recursive scanning
- **Offline Processing**: Batch updates without service interruption
- **Document Processing**: Multi-format support (Markdown, HTML, JSON, TXT)
- **Intelligent Chunking**: 800-character chunks with 150-character overlap

### 🎯 **Advanced Similarity Analysis**
- **Multi-Query Comparison**: Intersection, union, weighted, and ranked comparisons
- **Threshold-Based Filtering**: Configurable similarity cutoffs (0.7-0.9)
- **Result Limiting**: Top-K results with customizable limits

## 🛠️ Installation

```bash
git clone https://github.com/sbusanelli/automind-pro.git
cd automind-pro/backend
npm install
```

## ⚙️ Configuration

```bash
cp .env.example .env
# Edit .env with your Pinecone and OpenAI credentials
```

## 🎬 Quick Start

```bash
npm run dev
```

## 📚 Tech Stack

- **Runtime**: Node.js 20+
- **Database**: Pinecone Vector Database
- **AI**: OpenAI GPT-4, Claude
- **Frontend**: React + TypeScript
- **Authentication**: JWT with refresh tokens

## 📖 Documentation

- [Vector Database Setup](docs/vector-db-setup.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT
