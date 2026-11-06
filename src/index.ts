#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.js";

// The host launches this process. Standard output is reserved for MCP messages.
serveStdio(createServer);
