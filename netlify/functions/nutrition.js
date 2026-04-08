exports.handler = async function (event) {
 if (event.httpMethod !== "POST") {
   return { statusCode: 405, body: "Method Not Allowed" };
 }
 
 let body;
 try {
   body = JSON.parse(event.body);
 } catch {
   return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
 }
 
 const { prompt } = body;
 if (!prompt) {
   return { statusCode: 400, body: JSON.stringify({ error: "No prompt provided" }) };
 }
 
 try {
   const model = "gemini-2.5-flash-preview-04-17";
   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  
 
   const response = await fetch(url, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-goog-api-key": process.env.GEMINI_API_KEY,
     },
     body: JSON.stringify({
       contents: [{ role: "user", parts: [{ text: prompt }] }],
       generationConfig: { maxOutputTokens: 3000, temperature: 0.7 },
     }),
   });
 
   if (!response.ok) {
     const err = await response.json();
     console.error("Gemini API error:", err);
     return { statusCode: response.status, body: JSON.stringify({ error: "Gemini API error. Please try again." }) };
   }
 
   const data = await response.json();
   const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
 
   if (!text) {
     return { statusCode: 500, body: JSON.stringify({ error: "No response from Gemini. Please try again." }) };
   }
 
   return {
     statusCode: 200,
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ content: [{ type: "text", text }] }),
   };
 
 } catch (err) {
   console.error("Function error:", err);
   return { statusCode: 500, body: JSON.stringify({ error: "Server error. Please try again." }) };
 }
};
