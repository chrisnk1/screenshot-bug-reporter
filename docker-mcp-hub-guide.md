# Docker MCP Hub Guide

## Overview

The **Docker MCP Hub** is Docker's implementation of the Model Context Protocol (MCP), which allows LLMs to interact with Docker Hub APIs for intelligent content discovery and repository management.

## Key Components

1. **MCP Server** - Acts as a bridge between your AI assistant and Docker Hub APIs
2. **MCP Client** - Your AI application (like Claude Desktop, VS Code, or Docker's Gordon)
3. **MCP Catalog** - Collection of pre-built, containerized MCP servers

## How to Use It

### 1. Setting Up the Docker Hub MCP Server

**Prerequisites:**
- Docker installed
- Node.js 22+ (if building from source)
- Docker Personal Access Token (PAT) for private content

**Installation:**
```bash
npm install
npm run build
npm start
```

**With Authentication:**
```bash
HUB_PAT_TOKEN=<your_pat_token> npm start
```

### 2. Integration Options

#### With Docker's Gordon AI Assistant
- Create a `gordon-mcp.yml` file in your working directory
- Configure with your Docker Hub username and PAT token
- Use natural language to interact with Docker Hub

#### With VS Code
- Add Docker Hub MCP Server configuration to User Settings (JSON)
- Open Command Palette → "Preferences: Open User Settings (JSON)"
- Enables AI tools like Copilot to leverage Docker Hub context

#### With Continue Hub
- Use pre-configured MCP blocks (e.g., `mcp/postgres` for databases)
- Add blocks to your assistant with connection details

### 3. Benefits

- **Containerized Deployment** - MCP servers run in Docker containers for reliability
- **Natural Language Interface** - Interact with Docker Hub using plain English
- **Secure Credential Management** - MCP Toolkit handles authentication safely
- **Pre-built Servers** - MCP Catalog provides trusted, ready-to-use servers

## What This Enables

This allows your AI assistants to intelligently discover Docker images, manage repositories, and provide context-aware development workflows without manual API interactions.

## Resources

- [Docker Hub MCP Server GitHub](https://github.com/docker/hub-mcp-server)
- [Docker MCP Documentation](https://www.docker.com/products/mcp/)
- [Continue Hub MCP Blocks](https://continue.dev/docs/mcp)
