/**
 * CollabAI Editor — Demo Content
 * Demo document content for development testing.
 */

export const DEMO_CONTENT = `<h1>Introduction to Artificial Intelligence</h1>
<p>Artificial Intelligence (AI) is a broad field of computer science focused on building intelligent machines capable of performing tasks that typically require human intelligence. From natural language processing to computer vision, AI is transforming industries worldwide.</p>

<h2>Machine Learning Fundamentals</h2>
<p>Machine Learning (ML) is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data, learn from it, and make predictions or decisions. The three main types of machine learning are supervised learning, unsupervised learning, and reinforcement learning.</p>
<p>Supervised learning uses labeled training data to learn a mapping function from inputs to outputs. Common algorithms include linear regression, decision trees, random forests, and support vector machines. These are widely used in classification and regression tasks across healthcare, finance, and technology.</p>

<h2>Neural Networks and Deep Learning</h2>
<p>Neural networks are computing systems inspired by biological neural networks in the human brain. They consist of interconnected nodes (neurons) organized in layers: an input layer, one or more hidden layers, and an output layer. Deep learning refers to neural networks with many hidden layers, enabling them to learn complex, hierarchical representations of data.</p>
<p>Convolutional Neural Networks (CNNs) are particularly effective for image recognition tasks. Recurrent Neural Networks (RNNs) and their variants like LSTM and GRU excel at sequence data processing, making them ideal for natural language processing and time series analysis.</p>

<h2>Vector Databases and Embeddings</h2>
<p>Vector databases are specialized database systems designed to store, index, and query high-dimensional vector data efficiently. They are fundamental to modern AI applications, particularly those involving semantic search, recommendation systems, and retrieval-augmented generation (RAG).</p>
<p>Embeddings are dense numerical representations of data (text, images, audio) in continuous vector spaces. Models like Word2Vec, GloVe, and transformer-based models generate embeddings that capture semantic meaning. Similar concepts end up close together in the vector space, enabling similarity search using metrics like cosine similarity or Euclidean distance.</p>
<p>ChromaDB is an open-source embedding database that makes it easy to build AI applications with embeddings. It provides simple APIs for storing embeddings, querying for nearest neighbors, and filtering by metadata.</p>

<h2>Real-Time Collaboration Technology</h2>
<p>Real-time collaborative editing allows multiple users to work on the same document simultaneously. The key challenge is conflict resolution when multiple users make concurrent edits. Conflict-free Replicated Data Types (CRDTs) solve this by ensuring all replicas converge to the same state regardless of the order operations are applied.</p>
<p>Yjs is a high-performance CRDT implementation for building collaborative applications. It provides shared data types that synchronize automatically across all connected clients. Combined with WebSocket transport, Yjs enables sub-millisecond synchronization of document changes between users.</p>

<h2>Transformer Architecture</h2>
<p>The Transformer architecture, introduced in the seminal paper "Attention Is All You Need," revolutionized natural language processing. Unlike RNNs, Transformers process all positions in a sequence simultaneously using self-attention mechanisms, enabling massive parallelization during training.</p>
<p>Models like BERT, GPT, and T5 are built on the Transformer architecture. These large language models (LLMs) have achieved state-of-the-art results across numerous NLP benchmarks, including text classification, question answering, summarization, and translation.</p>`;
