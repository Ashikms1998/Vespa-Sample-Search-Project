How to start the app

Build and start

cd ve-vespa-minimax
docker compose up -d --build
docker compose ps

Health check

curl http://localhost:3000/health
curl http://localhost:3000/api/products


Is the app container running?

docker compose ps

If the container is running the STATUS column should be "Up"


PowerShell-Native Searching

Text search


Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/search `
  -ContentType 'application/json' `
  -Body (@{ query = 'iphone'; searchType = 'text' } | ConvertTo-Json)


Semantic search


Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/search `
  -ContentType 'application/json' `
  -Body (@{ query = 'laptop'; searchType = 'semantic' } | ConvertTo-Json)



Hybrid search


Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/search `
  -ContentType 'application/json' `
  -Body (@{ query = 'shoes'; searchType = 'hybrid' } | ConvertTo-Json)
