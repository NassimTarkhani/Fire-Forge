import { EndpointDoc } from "@/components/docs/EndpointDoc";

export default function ScrapeDocs() {
    return (
        <EndpointDoc
            title="Scrape URL"
            description="The Scrape endpoint allows you to extract high-quality structured data from any URL. It automatically handles JavaScript rendering, proxy rotation, and anti-bot bypass."
            endpoint="/v1/scrape"
            method="POST"
            cost="1 Credit"
            parameters={[
                {
                    name: "url",
                    type: "string",
                    required: true,
                    description: "The URL of the website you want to scrape."
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
                    description: "If true, removes noise like navigation bars, footers, and sidebars."
                },
                {
                    name: "waitFor",
                    type: "number",
                    required: false,
                    description: "Time in milliseconds to wait for the page to load (useful for SPAs)."
                },
                {
                    name: "headers",
                    type: "object",
                    required: false,
                    description: "Custom HTTP headers to send with the request."
                }
            ]}
            examples={{
                curl: `curl -X POST "https://fireforge.kapturo.online/v1/scrape" \\
    -H "Authorization: Bearer fg_YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
        "url": "https://example.com",
        "formats": ["markdown"],
        "onlyMainContent": true
    }'`,
                js: `const response = await fetch('https://fireforge.kapturo.online/v1/scrape', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer fg_YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://example.com',
        formats: ['markdown'],
        onlyMainContent: true
    })
});

const data = await response.json();`,
                python: `import requests

url = "https://fireforge.kapturo.online/v1/scrape"
headers = {
    "Authorization": "Bearer fg_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "url": "https://example.com",
    "formats": ["markdown"],
    "onlyMainContent": True
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
                response: `{
    "success": true,
    "data": {
        "content": "# Example Domain\\nThis domain is for use in illustrative examples...",
        "markdown": "# Example Domain\\nThis domain is for use in illustrative examples...",
        "metadata": {
            "title": "Example Domain",
            "sourceURL": "https://example.com"
        }
    }
}`
            }}
        />
    );
}
