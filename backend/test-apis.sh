echo "=== HEALTH ==="
curl -s "http://127.0.0.1:4000/health"
echo ""

echo "=== NEON SOURCES ==="
curl -s "http://127.0.0.1:4000/db/sources"
echo ""

echo "=== METADATA: Naruto ==="
curl -s "http://127.0.0.1:4000/metadata/search?q=naruto" | grep -o '"[a-zA-Z0-9_]*":\['
echo ""

echo "=== METADATA: Iron Man ==="
curl -s "http://127.0.0.1:4000/metadata/search?q=iron%20man" | grep -o '"[a-zA-Z0-9_]*":\['
echo ""

echo "=== METADATA: Arsenal ==="
curl -s "http://127.0.0.1:4000/metadata/search?q=arsenal" | grep -o '"[a-zA-Z0-9_]*":\['
echo ""
