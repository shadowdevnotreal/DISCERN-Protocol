/**
 * Groq code examples used by the API quick-start page.
 *
 * Keep the placeholders in one place so the page can safely substitute the
 * values entered by the user without constructing executable HTML.
 */
class APIExamples {
    constructor() {
        const example = (title, code) => ({ title, code });

        this.examples = {
            javascript: {
                fetch: { groq: example('JavaScript (Fetch)', `const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_GROQ_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'GROQ_MODEL',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

if (!response.ok) throw new Error(\`Groq request failed: \${response.status}\`);
const data = await response.json();
console.log(data.choices[0].message.content);`) },
                sdk: { groq: example('JavaScript (Groq SDK)', `import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: 'YOUR_GROQ_API_KEY' });
const completion = await groq.chat.completions.create({
  model: 'GROQ_MODEL',
  messages: [{ role: 'user', content: 'Hello!' }]
});
console.log(completion.choices[0].message.content);`) }
            },
            typescript: {
                groq: example('TypeScript', `import Groq from 'groq-sdk';

const client = new Groq({ apiKey: 'YOUR_GROQ_API_KEY' });
const completion = await client.chat.completions.create({
  model: 'GROQ_MODEL',
  messages: [{ role: 'user', content: 'Hello!' }]
});
console.log(completion.choices[0]?.message?.content);`)
            },
            python: {
                sdk: { groq: example('Python (Groq SDK)', `from groq import Groq

client = Groq(api_key="YOUR_GROQ_API_KEY")
completion = client.chat.completions.create(
    model="GROQ_MODEL",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(completion.choices[0].message.content)`) },
                requests: { groq: example('Python (Requests)', `import requests

response = requests.post(
    "https://api.groq.com/openai/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_GROQ_API_KEY"},
    json={
        "model": "GROQ_MODEL",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
    timeout=30,
)
response.raise_for_status()
print(response.json()["choices"][0]["message"]["content"])`) }
            },
            java: {
                groq: example('Java', `HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
    .header("Authorization", "Bearer YOUR_GROQ_API_KEY")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\\\"model\\\":\\\"GROQ_MODEL\\\",\\\"messages\\\":[{\\\"role\\\":\\\"user\\\",\\\"content\\\":\\\"Hello!\\\"}]}"))
    .build();
HttpResponse<String> response = HttpClient.newHttpClient()
    .send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`)
            },
            curl: {
                groq: example('cURL', `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"GROQ_MODEL","messages":[{"role":"user","content":"Hello!"}]}'`)
            },
            php: {
                groq: example('PHP', `$payload = json_encode([
    'model' => 'GROQ_MODEL',
    'messages' => [['role' => 'user', 'content' => 'Hello!']]
]);
$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_GROQ_API_KEY',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => $payload
]);
echo curl_exec($ch);`)
            },
            go: {
                groq: example('Go', `payload := strings.NewReader(\`{"model":"GROQ_MODEL","messages":[{"role":"user","content":"Hello!"}]}\`)
req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", payload)
if err != nil { log.Fatal(err) }
req.Header.Set("Authorization", "Bearer YOUR_GROQ_API_KEY")
req.Header.Set("Content-Type", "application/json")
resp, err := http.DefaultClient.Do(req)
if err != nil { log.Fatal(err) }
defer resp.Body.Close()
io.Copy(os.Stdout, resp.Body)`)
            },
            ruby: {
                groq: example('Ruby', `require 'net/http'
require 'json'

uri = URI('https://api.groq.com/openai/v1/chat/completions')
request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Bearer YOUR_GROQ_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {
  model: 'GROQ_MODEL',
  messages: [{ role: 'user', content: 'Hello!' }]
}.to_json
puts Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }.body`)
            }
        };
    }

    getLanguageExamples(language) {
        return this.examples[language] || {};
    }

    updateApiKeys(examples, apiKey) {
        return this.replacePlaceholder(examples, /YOUR_GROQ_API_KEY/g, apiKey);
    }

    updateModels(examples, model) {
        return this.replacePlaceholder(examples, /GROQ_MODEL/g, model);
    }

    replacePlaceholder(examples, pattern, value) {
        return examples.map(example => ({
            ...example,
            code: example.code.replace(pattern, value)
        }));
    }
}

window.APIExamples = APIExamples;
