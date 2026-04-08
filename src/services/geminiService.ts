export async function scanFrontendCode(code: string) {
  try {
    const response = await fetch('/api/chat-agents/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `
              Analyze the following frontend code for security vulnerabilities and performance issues.
              Provide a list of findings and suggested repairs.
              Return ONLY a JSON object with the following schema:
              {
                "vulnerabilities": [{"severity": "low"|"medium"|"high"|"critical", "description": "string", "suggestedFix": "string"}],
                "performanceIssues": [{"description": "string", "suggestedFix": "string"}],
                "repairedCode": "string"
              }
            `
          },
          {
            role: 'user',
            content: `Code to scan:\n${code}`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to scan code');
    }

    const data = await response.json();
    // The output is a string, we need to parse it as JSON
    return JSON.parse(data.output);
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
}
