---
name: secure-api
description: This skill will secure the API by implementing authentication and authorization mechanisms.
---

Secure REST API review:
- Ensure all endpoints are protected by authentication and authorization
- Validate all user inputs and sanitize data
- Implement rate limiting and throttling
- Implement logging and monitoring for security events
- Check the OWASP Top 10 vulnerabilities and ensure the API is protected against them

This skill works in two modalities:
- Review: The developer manually reviews the API code for security issues, don't change files only provide a report of the issues found.
- Improvement: The skill uses automated tools to analyze the API for security vulnerabilities and improve the code accordingly.
If the modalities are not specified, the skill will perform both review and ask if the developer wants to proceed with improvement.

