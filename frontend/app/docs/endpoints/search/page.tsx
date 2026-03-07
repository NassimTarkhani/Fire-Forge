import { EndpointDoc } from "@/components/docs/EndpointDoc";

export default function SearchDocs() {
    return (
        <EndpointDoc
            title="Search Content"
            description="The Search endpoint allows you to perform semantic searches across the web and retrieve structured results. It combines search engine results with real-time scraping capabilities."
            endpoint="/v1/search"
            method="POST"
            cost="1 Credit / Result"
            parameters={[
                {
                    name: "query",
                    type: "string",
                    required: true,
                    description: "The search query term."
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Number of search results to return (default: 5)."
                },
                {
                    name: "country",
                    type: "string",
                    required: false,
                    description: "Standard 2-letter country code (e.g. 'us', 'fr')."
                },
                {
                    name: "lang",
                    type: "string",
                    required: false,
                    description: "Language code for search results."
                }
            ]}
            examples={{
                curl: `curl -X POST "https://fireforge.kapturo.online/v1/search" \\
    -H "Authorization: Bearer fg_YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
        "query": "Who is the CEO of Google?",
        "limit": 3
    }'`,
                js: `const response = await fetch('https://fireforge.kapturo.online/v1/search', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer fg_YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: 'Who is the CEO of Google?',
        limit: 3
    })
});

const data = await response.json();`,
                python: `import requests

url = "https://fireforge.kapturo.online/v1/search"
headers = {
    "Authorization": "Bearer fg_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Who is the CEO of Google?",
    "limit": 3
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
                response: `{
    "success": true,
    "results": [
        {
            "title": "Sundar Pichai - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Sundar_Pichai",
            "snippet": "Sundar Pichai is an Indian-born American business executive. He is the CEO of Google...",
            "content": "# Sundar Pichai\\nSundar Pichai is the CEO of Alphabet and its subsidiary Google..."
        }
    ]
}`
            }}
        />
    );
}
