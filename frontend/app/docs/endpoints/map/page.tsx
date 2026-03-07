import { EndpointDoc } from "@/components/docs/EndpointDoc";

export default function MapDocs() {
    return (
        <EndpointDoc
            title="Map Structure"
            description="The Map endpoint analyzes a domain and returns all reachable URLs and their structure without scraping individual page content. Perfect for fast site reconnaissance."
            endpoint="/v1/map"
            method="POST"
            cost="1 Credit"
            parameters={[
                {
                    name: "url",
                    type: "string",
                    required: true,
                    description: "The base URL to map."
                },
                {
                    name: "search",
                    type: "string",
                    required: false,
                    description: "Optional filter to only return URLs matching a specific term."
                },
                {
                    name: "ignoreSitemap",
                    type: "boolean",
                    required: false,
                    description: "If true, skips the robots.txt and sitemap.xml lookup."
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Total URLs to return in the map (max: 5000)."
                }
            ]}
            examples={{
                curl: `curl -X POST "https://fireforge.kapturo.online/v1/map" \\
    -H "Authorization: Bearer fg_YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
        "url": "https://example.com",
        "limit": 100
    }'`,
                js: `const response = await fetch('https://fireforge.kapturo.online/v1/map', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer fg_YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://example.com',
        limit: 100
    })
});

const data = await response.json();`,
                python: `import requests

url = "https://fireforge.kapturo.online/v1/map"
headers = {
    "Authorization": "Bearer fg_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "url": "https://example.com",
    "limit": 100
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
                response: `{
    "success": true,
    "links": [
        "https://example.com/",
        "https://example.com/about",
        "https://example.com/contact",
        "https://example.com/blog/2026/hello-world"
    ]
}`
            }}
        />
    );
}
