/**
 * PlumberKit – GitHub Copilot Extension Server
 *
 * Entry point for the Express application that handles incoming
 * GitHub Copilot Extension requests.
 *
 * Environment variables:
 *   PORT                  – HTTP port (default: 3000)
 *   SKIP_SIGNATURE_CHECK  – Set to "true" to bypass signature verification
 *                           during local development (never use in production).
 */

import express from "express";
import {
  createAckEvent,
  createDoneEvent,
  createErrorsEvent,
  verifyAndParseRequest,
  parseRequestBody,
} from "@copilot-extensions/preview-sdk";
import rateLimit from "express-rate-limit";
import { demoAgent } from "./agents/demo-agent.js";

const app = express();
const port = process.env.PORT || 3000;

// Rate-limit all extension requests: at most 60 requests per minute per IP.
// Adjust windowMs and max to suit your deployment needs.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// Parse incoming JSON bodies and make the raw body available for signature checks
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.post("/", async (req, res) => {
  const tokenForUser = req.get("X-GitHub-Token") ?? "";
  const signature = req.get("Github-Public-Key-Signature") ?? "";
  const keyId = req.get("Github-Public-Key-Identifier") ?? "";

  let payload;

  try {
    if (process.env.SKIP_SIGNATURE_CHECK === "true") {
      // Development shortcut: skip cryptographic signature verification
      payload = parseRequestBody(req.rawBody);
    } else {
      const { isValidRequest, payload: parsedPayload } =
        await verifyAndParseRequest(req.rawBody, signature, keyId, {
          token: tokenForUser,
        });

      if (!isValidRequest) {
        res.status(401).json({ error: "Unauthorized: invalid signature" });
        return;
      }

      payload = parsedPayload;
    }
  } catch (err) {
    res.status(400).json({ error: `Bad request: ${err.message}` });
    return;
  }

  // Set up Server-Sent Events stream
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Acknowledge the request so GitHub knows we received it
  res.write(createAckEvent());

  try {
    await demoAgent(payload, tokenForUser, res);
  } catch (err) {
    res.write(
      createErrorsEvent([
        {
          type: "agent",
          message: err.message,
          code: "500",
          identifier: "agent_error",
        },
      ])
    );
  }

  res.write(createDoneEvent());
  res.end();
});

app.listen(port, () => {
  console.log(`PlumberKit server running on port ${port}`);
});
