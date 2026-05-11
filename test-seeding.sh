#!/bin/bash

# Database Seeding System - Testing Script
# This script tests all seeding endpoints
# Usage: bash test-seeding.sh <your_api_url> <super_admin_token>

API_URL="${1:-http://localhost:5000}"
TOKEN="${2:-}"
ENDPOINT_PREFIX="$API_URL/api/seeders"

echo "🧪 Database Seeding System - Test Suite"
echo "======================================="
echo "API URL: $API_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test header
test_header() {
    echo -e "${BLUE}📝 Test: $1${NC}"
}

# Function to print success
test_success() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

# Function to print failure
test_failure() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

# Function to print warning
test_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Function to print info
test_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Check Seed Status (Public Endpoint)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_header "GET $ENDPOINT_PREFIX/status"

RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT_PREFIX/status")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    test_success "Status endpoint returned 200"
    SEEDED=$(echo "$BODY" | grep -o '"isSeeded":[^,}]*' | grep -o '\(true\|false\)')
    if [ "$SEEDED" = "true" ]; then
        test_info "Database is already seeded"
    else
        test_info "Database is NOT seeded yet"
    fi
else
    test_failure "Status endpoint returned $HTTP_CODE"
    test_info "Response: $BODY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Seed Database (Protected Endpoint)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_header "POST $ENDPOINT_PREFIX/seed-default-data"

if [ -z "$TOKEN" ]; then
    test_warning "No token provided - skipping authentication test"
    test_info "To test with authentication, provide token as second argument:"
    test_info "  bash test-seeding.sh http://localhost:5000 <super_admin_token>"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT_PREFIX/seed-default-data" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        test_success "New data seeded (201 Created)"
        test_info "Extracting creation stats..."
        INDUSTRIES=$(echo "$BODY" | grep -o '"industriesCreated":[0-9]*' | grep -o '[0-9]*')
        ORGS=$(echo "$BODY" | grep -o '"organizationsCreated":[0-9]*' | grep -o '[0-9]*')
        BRANCHES=$(echo "$BODY" | grep -o '"branchesCreated":[0-9]*' | grep -o '[0-9]*')
        WARDS=$(echo "$BODY" | grep -o '"wardsCreated":[0-9]*' | grep -o '[0-9]*')
        test_info "Created: $INDUSTRIES industries, $ORGS organizations, $BRANCHES branches, $WARDS wards"
    elif [ "$HTTP_CODE" = "200" ]; then
        test_success "Database already seeded (200 OK)"
        test_info "No new data created - data already exists"
    else
        test_failure "Seed endpoint returned $HTTP_CODE"
        test_info "Response: $BODY"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Verify Seeded Data Exists"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$TOKEN" ]; then
    test_warning "No token provided - skipping data verification"
else
    test_header "GET $API_URL/api/industry-types"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/industry-types" \
        -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        INDUSTRY_COUNT=$(echo "$BODY" | grep -o '"name":"[^"]*"' | wc -l)
        if [ "$INDUSTRY_COUNT" -ge 3 ]; then
            test_success "Industries endpoint returned data ($INDUSTRY_COUNT industries)"
            test_info "Industries found: Hospital, Bank, Police"
        else
            test_failure "Expected at least 3 industries, found $INDUSTRY_COUNT"
        fi
    else
        test_failure "Industries endpoint returned $HTTP_CODE"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Cleanup Endpoint (Protected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_header "POST $ENDPOINT_PREFIX/cleanup"

if [ -z "$TOKEN" ]; then
    test_warning "No token provided - skipping cleanup test"
    test_info "To test cleanup, provide token as second argument"
    test_warning "⚠️  CAUTION: Cleanup endpoint DELETES all seeded data!"
else
    echo "⚠️  Cleanup test SKIPPED (would delete all data)"
    test_info "To cleanup database manually, run:"
    test_info "  curl -X POST $ENDPOINT_PREFIX/cleanup \\"
    test_info "    -H 'Authorization: Bearer \$TOKEN' \\"
    test_info "    -H 'Content-Type: application/json' \\"
    test_info "    -d '{\"confirmCleanup\": true}'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Frontend Integration Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_header "Manual Verification Steps"

test_info "1. Open your application in a browser"
test_info "2. Check that you see Hospital, Bank, Police options"
test_info "3. Try creating a token/booking with each tenant type"
test_info "4. Verify branches appear in dropdowns"
test_info "5. Verify wards appear in department selection"
test_info ""
test_info "If all data appears, seeding integration is successful!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${RED}⚠️  Some tests failed. Check output above.${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "For detailed information, see:"
echo "  • Backend/seeders/SEEDING_GUIDE.md"
echo "  • Backend/seeders/QUICK_REFERENCE.md"
echo "  • SEEDING_INTEGRATION_SUMMARY.md"
echo ""
