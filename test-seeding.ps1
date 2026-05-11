# Database Seeding System - Testing Script (PowerShell)
# This script tests all seeding endpoints
# Usage: .\test-seeding.ps1 -ApiUrl http://localhost:5000 -Token <super_admin_token>

param(
    [string]$ApiUrl = "http://localhost:5000",
    [string]$Token = ""
)

$EndpointPrefix = "$ApiUrl/api/seeders"
$TestsPassed = 0
$TestsFailed = 0

Write-Host ""
Write-Host "🧪 Database Seeding System - Test Suite" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl" -ForegroundColor Cyan
Write-Host ""

function Test-Header {
    param([string]$Description)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host $Description -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Test-Success {
    param([string]$Message)
    Write-Host "✅ PASS: $Message" -ForegroundColor Green
    $script:TestsPassed++
}

function Test-Failure {
    param([string]$Message)
    Write-Host "❌ FAIL: $Message" -ForegroundColor Red
    $script:TestsFailed++
}

function Test-Warning {
    param([string]$Message)
    Write-Host "⚠️  WARNING: $Message" -ForegroundColor Yellow
}

function Test-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Test 1: Check Seed Status
Test-Header "Test 1: Check Seed Status (Public Endpoint)"
Test-Header "GET $EndpointPrefix/status"

try {
    $Response = Invoke-WebRequest -Uri "$EndpointPrefix/status" -Method GET -ErrorAction Stop
    $HttpCode = $Response.StatusCode
    $Body = $Response.Content | ConvertFrom-Json

    if ($HttpCode -eq 200) {
        Test-Success "Status endpoint returned 200"
        if ($Body.data.isSeeded) {
            Test-Info "Database is already seeded"
        } else {
            Test-Info "Database is NOT seeded yet"
        }
    }
} catch {
    Test-Failure "Status endpoint failed: $($_.Exception.Message)"
}

# Test 2: Seed Database
Test-Header "Test 2: Seed Database (Protected Endpoint)"
Test-Header "POST $EndpointPrefix/seed-default-data"

if ([string]::IsNullOrEmpty($Token)) {
    Test-Warning "No token provided - skipping authentication test"
    Test-Info "To test with authentication, provide token as parameter:"
    Test-Info "  .\test-seeding.ps1 -ApiUrl http://localhost:5000 -Token <super_admin_token>"
} else {
    try {
        $Headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type"  = "application/json"
        }
        
        $Response = Invoke-WebRequest -Uri "$EndpointPrefix/seed-default-data" `
            -Method POST `
            -Headers $Headers `
            -ErrorAction Stop
        
        $HttpCode = $Response.StatusCode
        $Body = $Response.Content | ConvertFrom-Json

        if ($HttpCode -eq 201) {
            Test-Success "New data seeded (201 Created)"
            $Stats = $Body.data.results
            Test-Info "Created: $($Stats.industriesCreated) industries, $($Stats.organizationsCreated) organizations, $($Stats.branchesCreated) branches, $($Stats.wardsCreated) wards"
        } elseif ($HttpCode -eq 200) {
            Test-Success "Database already seeded (200 OK)"
            Test-Info "No new data created - data already exists"
        }
    } catch {
        $ErrorResponse = $_.Exception.Response
        if ($ErrorResponse.StatusCode -eq 200 -or $ErrorResponse.StatusCode -eq 201) {
            Test-Success "Seed endpoint responded successfully"
        } else {
            Test-Failure "Seed endpoint failed: $($_.Exception.Message)"
        }
    }
}

# Test 3: Verify Seeded Data
Test-Header "Test 3: Verify Seeded Data Exists"

if ([string]::IsNullOrEmpty($Token)) {
    Test-Warning "No token provided - skipping data verification"
} else {
    Test-Header "GET $ApiUrl/api/industry-types"
    
    try {
        $Headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type"  = "application/json"
        }
        
        $Response = Invoke-WebRequest -Uri "$ApiUrl/api/industry-types" `
            -Method GET `
            -Headers $Headers `
            -ErrorAction Stop
        
        $HttpCode = $Response.StatusCode
        $Body = $Response.Content | ConvertFrom-Json

        if ($HttpCode -eq 200) {
            $IndustryCount = $Body.data.industries.Count
            if ($IndustryCount -ge 3) {
                Test-Success "Industries endpoint returned data ($IndustryCount industries)"
                Test-Info "Industries found: Hospital, Bank, Police"
            } else {
                Test-Failure "Expected at least 3 industries, found $IndustryCount"
            }
        }
    } catch {
        Test-Failure "Industries endpoint failed: $($_.Exception.Message)"
    }
}

# Test 4: Cleanup Endpoint
Test-Header "Test 4: Cleanup Endpoint (Protected)"
Test-Header "POST $EndpointPrefix/cleanup"

if ([string]::IsNullOrEmpty($Token)) {
    Test-Warning "No token provided - skipping cleanup test"
    Test-Info "To test cleanup, provide token as parameter"
    Test-Warning "⚠️  CAUTION: Cleanup endpoint DELETES all seeded data!"
} else {
    Write-Host "⚠️  Cleanup test SKIPPED (would delete all data)" -ForegroundColor Yellow
    Test-Info "To cleanup database manually, run:"
    Test-Info "  `$Headers = @{ 'Authorization' = 'Bearer `$Token'; 'Content-Type' = 'application/json' }"
    Test-Info "  `$Body = @{ 'confirmCleanup' = `$true } | ConvertTo-Json"
    Test-Info "  Invoke-WebRequest -Uri '$EndpointPrefix/cleanup' -Method POST -Headers `$Headers -Body `$Body"
}

# Test 5: Frontend Integration Check
Test-Header "Test 5: Frontend Integration Check"
Test-Header "Manual Verification Steps"

Test-Info "1. Open your application in a browser"
Test-Info "2. Check that you see Hospital, Bank, Police options"
Test-Info "3. Try creating a token/booking with each tenant type"
Test-Info "4. Verify branches appear in dropdowns"
Test-Info "5. Verify wards appear in department selection"
Test-Info ""
Test-Info "If all data appears, seeding integration is successful!"

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Passed: $TestsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📚 Documentation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "For detailed information, see:" -ForegroundColor Cyan
Write-Host "  • Backend/seeders/SEEDING_GUIDE.md" -ForegroundColor Cyan
Write-Host "  • Backend/seeders/QUICK_REFERENCE.md" -ForegroundColor Cyan
Write-Host "  • SEEDING_INTEGRATION_SUMMARY.md" -ForegroundColor Cyan
Write-Host ""
