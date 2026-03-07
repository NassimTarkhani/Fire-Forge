import { EndpointDoc } from "@/components/docs/EndpointDoc";

export default function BatchScrapeDocs() {
    return (
        <EndpointDoc
            title="Batch Scrape"
            description="The Batch Scrape endpoint allows you to scrape multiple independent URLs concurrently. This is the most efficient way to process large lists of heterogeneous websites."
            endpoint="/v1/batch/scrape"
            method="POST"
            cost="1 Credit / URL"
            parameters={[
                {
                    name: "urls",
                    type: "string[]",
                    required: true,
                    description: "An array of URLs to scrape concurrently."
                },
                {
                    name: "formats",
                    type: "string[]",
                    required: false,
                    description: "Requested response formats. Supported: ['markdown', 'html']."
                },
                {
                    name: "onlyMainContent",
                    type: "boolean",
                    required: false,
                    description: "Apply cleaning to all URLs in the batch."
                }
            ]}
            examples={{
                curl: `curl -X POST "https://fireforge.kapturo.online/v1/batch/scrape" \\
    -H "Authorization: Bearer fg_YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
        "urls": ["https://example.com", "https://google.com"],
        "formats": ["markdown"]
    }'`,
                js: `const response = await fetch('https://fireforge.kapturo.online/v1/batch/scrape', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer fg_YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        urls: ['https://example.com', 'https://google.com'],
        formats: ['markdown']
    })
});

const data = await response.json();`,
                python: `import requests

url = "https://fireforge.kapturo.online/v1/batch/scrape"
headers = {
    "Authorization": "Bearer fg_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "urls": ["https://example.com", "https://google.com"],
    "formats": ["markdown"]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
                response: `{
    "success": true,
    "data": [
        {
            "url": "https://example.com",
            "content": "# Example Domain..."
        },
        {
            "url": "https://google.com",
            "content": "# Google Search..."
        }
    ]
}`
            }}
        />
    );
}
