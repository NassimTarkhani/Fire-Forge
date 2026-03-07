import { EndpointDoc } from "@/components/docs/EndpointDoc";

export default function CrawlDocs() {
    return (
        <EndpointDoc
            title="Crawl Job"
            description="The Crawl endpoint initiates an asynchronous crawling job to navigate through an entire domain and extract data from multiple pages based on your specified depth and limit."
            endpoint="/v1/crawl"
            method="POST"
            cost="1 Credit / Page"
            parameters={[
                {
                    name: "url",
                    type: "string",
                    required: true,
                    description: "The base URL to start crawling from."
                },
                {
                    name: "maxDepth",
                    type: "number",
                    required: false,
                    description: "Maximum depth to crawl from the base URL (default: 2)."
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Maximum number of pages to crawl (default: 10)."
                },
                {
                    name: "excludePaths",
                    type: "string[]",
                    required: false,
                    description: "URLs matching these patterns will be skipped."
                },
                {
                    name: "scrapeOptions",
                    type: "object",
                    required: false,
                    description: "Settings to apply to each crawled page (e.g., formats: ['markdown'])."
                }
            ]}
            examples={{
                curl: `curl -X POST "https://fireforge.kapturo.online/v1/crawl" \\
    -H "Authorization: Bearer fg_YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
        "url": "https://example.com",
        "maxDepth": 1,
        "limit": 5,
        "scrapeOptions": { "formats": ["markdown"] }
    }'`,
                js: `const response = await fetch('https://fireforge.kapturo.online/v1/crawl', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer fg_YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://example.com',
        maxDepth: 1,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] }
    })
});

const data = await response.json();
const jobId = data.jobId;`,
                python: `import requests

url = "https://fireforge.kapturo.online/v1/crawl"
headers = {
    "Authorization": "Bearer fg_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "url": "https://example.com",
    "maxDepth": 1,
    "limit": 5,
    "scrapeOptions": { "formats": ["markdown"] }
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
                response: `{
    "success": true,
    "jobId": "crawl_abc123_xyz789",
    "status": "pending",
    "check_url": "https://fireforge.kapturo.online/v1/crawl/crawl_abc123_xyz789"
}`
            }}
        />
    );
}
